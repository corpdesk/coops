import cloneDeep from 'lodash.clonedeep'; // Ensure lodash.clonedeep is installed

import { BaseService } from '../../../sys/base/base.service';
import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser, ICdRequest, ISessionDataExt } from '../../../sys/base/IBase';
import { CoopStatModel } from '../models/coop-stat.model';
// import { CoopStatViewModel, siGet } from '../models/coop-view.model';
import { CoopTypeModel } from '../models/coop-type.model';
import { CoopStatViewModel } from '../models/coop-stat-view.model';
import { siGet } from '../../../sys/base/base.model';
import { CdGeoLocationService } from '../../cd-geo/services/cd-geo-location.service';
import { Logging } from '../../../sys/base/winston.log';
import { CoopStatPublicFilterService } from './coop-stat-public-filter.service';
import { CdGeoLocationModel } from '../../cd-geo/models/cd-geo-location.model';
import { CoopModel } from '../models/coop.model';

export class CoopStatService extends CdService {
    logger: Logging;
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CoopStatModel;
    modelName: "CoopStatModel";
    sessModel;
    sessDataExt: ISessionDataExt;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['coopStatName', 'coopTypeId', 'coopStatDateLabel'],
        noDuplicate: ['coopStatName', 'coopStatDateLabel']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.logger = new Logging();
        this.serviceModel = new CoopStatModel();
    }

    async initSession(req, res) {
        const svSess = new SessionService();
        this.sessDataExt = await svSess.getSessionDataExt(req, res);
    }

    /**
    * {
       "ctx": "App",
       "m": "Coops",
       "c": "Coop",
       "a": "Create",
       "dat": {
           "f_vals": [
           {
               "data": {
                   "coopStatGuid":"",
                   "coopStatName": "Benin", 
                   "coopStatDescription":"2005",
                   "cdGeoLocationId":null,
                   "coopWoccu": false,
                   "coopCount": null,
                   "coopMembersCount": 881232, 
                   "coopSavesShares":56429394,
                   "coopLoans":45011150,
                   "coopReserves":null, 
                   "coopAssets": null,
                   "coopMemberPenetration":20.95,
                   "coopStatDateLabel": "2005-12-31 23:59:59",
                   "coopStatRefId":null
               }
           }
           ],
           "token": "3ffd785f-e885-4d37-addf-0e24379af338"
       },
       "args": {}
       }
    * @param req
    * @param res
    */
    async create(req, res) {
        this.logger.logInfo('coop/create::validateCreate()/01')

        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: CoopStatModel,
                modelName: "CoopStatModel",
                serviceModelInstance: this.serviceModel,
                docName: 'Create Coop',
                dSource: 1,
            }
            this.logger.logInfo('CoopService::create()/serviceInput:', serviceInput)
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new Coop created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            this.logger.logInfo('coop/create::validateCreate()/02')
            const r = await this.b.respond(req, res);
        }
    }

    async createSL(req, res) {
        const svSess = new SessionService();
        await this.b.initSqlite(req, res)
        if (await this.validateCreateSL(req, res)) {
            await this.beforeCreateSL(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CoopStatModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Coop',
                dSource: 1,
            }
            const result = await this.b.createSL(req, res, serviceInput)
            this.b.connSLClose()
            this.b.i.app_msg = '';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = result;
            const r = await this.b.respond(req, res);
        } else {
            const r = await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<CoopStatModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    /**
     * CreateM, Create multiple records
     *  - 1. validate the loop field for multiple data
     *  - 2. loop through the list
     *  - 3. in each cycle:
     *      - get createItem
     *      - createI(createItem)
     *      - save return value
     *  - 4. set return data
     *  - 5. return data
     * 
     * {
        "ctx": "App",
        "m": "Coops",
        "c": "Coop",
        "a": "CreateM",
        "dat": {
            "f_vals": [
            {
                "data": [
                {
                    "coopStatGuid": "",
                    "coopStatName": "Kenya",
                    "coopStatDescription": "2006",
                    "cdGeoLocationId": null,
                    "coopWoccu": false,
                    "coopCount": 2993,
                    "coopMembersCount": 3265545,
                    "coopSavesShares": 1608009012,
                    "coopLoans": 1604043550,
                    "coopReserves": 102792479,
                    "coopAssets": 2146769999,
                    "coopMemberPenetration": 16.01,
                    "coopStatDateLabel": "2006-12-31 23:59:59",
                    "coopStatRefId": null
                },
                {
                    "coopStatGuid": "",
                    "coopStatName": "Malawi",
                    "coopStatDescription": "2006",
                    "cdGeoLocationId": null,
                    "coopWoccu": false,
                    "coopCount": 70,
                    "coopMembersCount": 62736,
                    "coopSavesShares": 6175626,
                    "coopLoans": 4946246,
                    "coopReserves": 601936,
                    "coopAssets": 7407250,
                    "coopMemberPenetration": 0.9,
                    "coopStatDateLabel": "2006-12-31 23:59:59",
                    "coopStatRefId": null
                }
                ]
            }
            ],
            "token": "3ffd785f-e885-4d37-addf-0e24379af338"
        },
        "args": {}
        }
     * 
     * 
     * @param req 
     * @param res 
     */
    async createM(req, res) {
        this.logger.logInfo('CoopService::createM()/01')
        let data = req.post.dat.f_vals[0].data
        this.logger.logInfo('CoopService::createM()/data:', data)
        // this.b.models.push(CoopStatModel)
        // this.b.init(req, res)

        for (var coopData of data) {
            this.logger.logInfo('coopData', coopData)
            const coopQuery: CoopStatModel = coopData;
            const svCoop = new CoopStatService();
            const si = {
                serviceInstance: svCoop,
                serviceModel: CoopStatModel,
                serviceModelInstance: svCoop.serviceModel,
                docName: 'CoopService::CreateM',
                dSource: 1,
            }
            const createIParams: CreateIParams = {
                serviceInput: si,
                controllerData: coopQuery
            }
            let ret = await this.createI(req, res, createIParams)
            this.logger.logInfo('CoopService::createM()/forLoop/ret:', { ret: ret })
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement 
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "coopStatName",
            //     "coopStatDescription"
            // ],
            "where": {},
            "take": 5,
            "skip": 0
        }
        this.getCoop(req, res, q)
    }

    async CoopExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CoopStatModel,
            docName: 'CoopService::CoopExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'coopStatGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'coopStatEnabled', value: true });
        return true;
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'coopStatGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'coopStatEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        // const serviceInput: IServiceInput = {
        //     serviceInstance: this,
        //     serviceModel: CoopStatModel,
        //     docName: 'CoopService::CoopExists',
        //     cmd: {
        //         action: 'find',
        //         query: { where: params.filter }
        //     },
        //     dSource: 1,
        // }
        return this.b.read(req, res, serviceInput)
    }

    async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopService::getCoop/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('CoopService::read$()/r:', r)
                    this.b.i.code = 'CoopService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('CoopService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    update(req, res) {
        // this.logger.logInfo('CoopService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // this.logger.logInfo('CoopService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    updateSL(req, res) {
        this.logger.logInfo('CoopService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        this.logger.logInfo('CoopService::update()/02')
        this.b.updateSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q: any) {
        if (q.update.CoopEnabled === '') {
            q.update.CoopEnabled = null;
        }
        return q;
    }

    beforeUpdateSL(q: any) {
        if (q.update.billEnabled === '') {
            q.update.billEnabled = null;
        }
        return q;
    }

    async remove(req, res) {
        //
    }

    /**
     * methods for transaction rollback
     */
    rbCreate(): number {
        return 1;
    }

    rbUpdate(): number {
        return 1;
    }

    rbDelete(): number {
        return 1;
    }

    async validateCreate(req, res) {
        this.logger.logInfo('coop/CoopService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CoopStatModel,
        }
        this.b.i.code = 'CoopService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            this.logger.logInfo('coop/CoopService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                this.logger.logInfo('coop/CoopService::validateCreate()/03')
                ret = true;
            } else {
                this.logger.logInfo('coop/CoopService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            this.logger.logInfo('coop/CoopService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        this.logger.logInfo('coop/CoopService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the coopTypeId referenced exists
        const pl: CoopStatModel = this.b.getPlData(req);
        if ('coopTypeId' in pl) {
            this.logger.logInfo('coop/CoopService::validateCreate()/07')
            this.logger.logInfo('coop/CoopService::validateCreate()/pl:', pl)
            const serviceInput = {
                serviceModel: CoopTypeModel,
                docName: 'CoopService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { coopTypeId: pl.coopTypeId } }
                },
                dSource: 1
            }
            this.logger.logInfo('coop/CoopService::validateCreate()/serviceInput:', { serviceInput: JSON.stringify(serviceInput) })
            const r: any = await this.b.read(req, res, serviceInput)
            this.logger.logInfo('coop/CoopService::validateCreate()/r:', r)
            if (r.length > 0) {
                this.logger.logInfo('coop/CoopService::validateCreate()/08')
                ret = true;
            } else {
                this.logger.logInfo('coop/CoopService::validateCreate()/10')
                ret = false;
                this.b.i.app_msg = `Coop type reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            this.logger.logInfo('coop/CoopService::validateCreate()/11')
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `coopTypeId is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        this.logger.logInfo('CoopService::getCoop/12');
        if (this.b.err.length > 0) {
            this.logger.logInfo('coop/CoopService::validateCreate()/13')
            ret = false;
        }
        return ret;
    }

    async validateCreateSL(req, res) {
        return true;
    }

    /**
     * 
     * curl test:
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "Coops","c": "Coop","a": "Get","dat": {"f_vals": [{"query": {"where": {"coopStatName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     * @param q 
     */
    async getCoop(req, res, q: IQuery = null): Promise<any> {

        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CoopService::getCoop/f:', q);
        // const serviceInput = siGet(q,this)
        this.serviceModel = new CoopStatModel();
        const serviceInput: IServiceInput = this.b.siGet(q,'CoopStatService:getCoop' , CoopStatModel)
        serviceInput.serviceModelInstance = this.serviceModel
        serviceInput.serviceModel = CoopStatModel
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            this.logger.logInfo('CoopService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    /**
     * Queey params:
     * - selected data level eg all-available, world, continent, country, continental-region, national-region
     * - list of selected items 
     * - eg: 
     * - on selection of all-available, show list of countries availaable with summary data
     * - on selection of world show continents with available data
     * - on selection of continent show list of countries availaable with summary data
     * - on selection of countrie list of national-resions availaable with summary data
     * - on selection of national-region given national-resion with summary data
     * @param q 
     */
    async getCoopStats(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CoopService::getCoopStats/q:', q);
        const serviceInput = siGet(q, this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            this.logger.logInfo('CoopService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getCoopSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopService::getCoop/q:', q);
        const serviceInput = siGet(q, this)
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('CoopService::read$()/r:', r)
                    this.b.i.code = 'CoopService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('CoopService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    /**
     * 
     * curl test:
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "GetType","dat":{"f_vals": [{"query":{"where": {"coopTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    getCoopType(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopService::getCoop/f:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopService::getCoopType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('CoopService::read$()/r:', r)
                    this.b.i.code = 'CoopController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('CoopService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    /**
     * 
     * @param req 
     * @param res 
     */
    getCoopPaged(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopService::getCoopPaged/q:', q);
        const serviceInput = {
            serviceModel: CoopStatViewModel,
            docName: 'CoopService::getCoopPaged$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    getPagedSL(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopService::getCoopPaged()/q:', q);
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::getCoopPaged',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    getCoopTypeCount(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopService::getCoopPaged/q:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopService::getCoopPaged$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    delete(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::delete',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }

        this.b.delete$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    deleteSL(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopService::deleteSL()/q:', q)
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::deleteSL',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }

        this.b.deleteSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    /**
     * This method is used internally by other methods in data agregation
     * @param req 
     * @param res 
     * @param q 
     * @returns 
     */
    async getCoopI(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CoopService::getCoopI/q:', q);
        let serviceModel = new CoopStatViewModel();
        const serviceInput: IServiceInput = this.b.siGet(q, 'CoopStatService:getCoopI' ,CoopStatViewModel)
        serviceInput.serviceModelInstance = serviceModel
        serviceInput.serviceModel = CoopStatViewModel
        try {
            let respData = await this.b.read(req, res, serviceInput)
            return { data: respData, error: null }
        } catch (e) {
            this.logger.logInfo('CoopService::read()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            return { data: null, error: e }
        }
    }

    /**
     * get data by geo-location
     * 1. get data from n selected locations
     * 2. list countries queried
     * 3. derive polulation data from geoLocation data
     * @param req 
     * @param res 
     */
    // async StatsByGeoLocation(req, res, q: IQuery = null) {
    //     if (q === null) {
    //         q = this.b.getQuery(req);
    //     }

    //     let svCoopStatPublicFilter = new CoopStatPublicFilterService()
    //     let svCdGeoLocationService = new CdGeoLocationService()

    //     /**
    //     * Apply public filter:
    //     * This filter is meant to be applied against an in coming query for 
    //     * coopStat. 
    //     * Additional filters will be applied as per array settings hosted in 
    //     * coopStatPublicFilter in the coopStatPublicFilterSpecs JSON field
    //     * The setting also optionally include exemptions for selected users and groups
    //     */
    //     q = await svCoopStatPublicFilter.applyCoopStatFilter(req, res, q)
    //     console.log('CoopStatService::StatsByGeoLocation()/q1:', q)

    //     // make sure the query is complient to CdGeoLocationModel
    //     const geoLocationQuery = await this.b.validateQuery(q, CdGeoLocationModel);
    //     console.log('CoopStatService::StatsByGeoLocation()/q2:', q)
    //     console.log('CoopStatService::StatsByGeoLocation()/geoLocationQuery:', geoLocationQuery)
    //     // fetch geo data
    //     let gData = await svCdGeoLocationService.getGeoLocationI(req, res, geoLocationQuery)


    //     // set order for results
    //     q.order = { "coopStatDateLabel": "ASC" }
    //     // make sure the query is compliant with CoopStatViewModel
    //     const coopQuery = await this.b.validateQuery(q, CoopStatViewModel);
    //     console.log('CoopStatService::StatsByGeoLocation()/coopQuery:', coopQuery)
    //     console.log('CoopStatService::StatsByGeoLocation()/q3:', q)
    //     // get statistical data
    //     let cData = await this.getCoopI(req, res, q)

    //     // set data response format
    //     let ret = {
    //         geoLocationData: gData.data,
    //         coopData: cData.data,
    //     }
    //     this.logger.logInfo('CoopService::StatsByGeoLocation()/ret:', ret)
    //     this.b.cdResp.data = await ret;
    //     this.b.respond(req, res)
    // }
    

    async StatsByGeoLocation(req, res, q: IQuery = null) {
        try{
            if (q === null) {
                q = this.b.getQuery(req);
            }
    
            let svCoopStatPublicFilter = new CoopStatPublicFilterService();
            let svCdGeoLocationService = new CdGeoLocationService();
    
            // Apply public filter
            q = await svCoopStatPublicFilter.applyCoopStatFilter(req, res, q);
            console.log('CoopStatService::StatsByGeoLocation()/q1:', q);
    
            // Create a clean copy of q for validation
            let qCdGeoLocation = cloneDeep(q);
    
            // Make sure the query is compliant to CdGeoLocationModel
            qCdGeoLocation = await this.b.validateQuery(qCdGeoLocation, CdGeoLocationModel);
            console.log('CoopStatService::StatsByGeoLocation()/q2:', q);
            console.log('CoopStatService::StatsByGeoLocation()/qCdGeoLocation:', qCdGeoLocation);
    
            // Fetch geo data
            let gData = await svCdGeoLocationService.getGeoLocationI(req, res, qCdGeoLocation);
    
            // Set order for results
            q.order = { "coopStatDateLabel": "ASC" };
    
            // Create a clean copy of q for validation
            let qCoopStatView = cloneDeep(q);
            console.log('CoopStatService::StatsByGeoLocation()/qCoopStatView1:', qCoopStatView);
            // Make sure the query is compliant with CoopStatViewModel
            qCoopStatView = await this.b.validateQuery(qCoopStatView, CoopStatViewModel);
            console.log('CoopStatService::StatsByGeoLocation()/qCoopStatView2:', qCoopStatView);
            console.log('CoopStatService::StatsByGeoLocation()/q3:', q);
    
            // Get statistical data
            let cData = await this.getCoopI(req, res, q);
    
            // Set data response format
            let ret = {
                geoLocationData: gData.data,
                coopData: cData.data,
            };
            this.logger.logInfo('CoopService::StatsByGeoLocation()/ret:', ret);
            this.b.cdResp.app_state.success = true;
            this.b.cdResp.data = await ret;
            this.b.respond(req, res);
        } catch(e){
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopStateService:StatsByGeoLocation',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }

        
    }

}

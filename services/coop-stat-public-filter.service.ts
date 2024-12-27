import { BaseService } from '../../../sys/base/base.service';
import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser, ICdRequest, ISessionDataExt } from '../../../sys/base/IBase';
import { CoopStatPublicFilterModel, coopStatPublicFilterSpecs } from '../models/coop-stat-public-filter.model';
// import { CoopStatPublicFilterModel, siGet } from '../models/coop-view.model';
import { CoopTypeModel } from '../models/coop-type.model';
// import { CoopStatPublicFilterModel } from '../models/coop_stat_public_filter-view.model';
import { siGet } from '../../../sys/base/base.model';
import { CdGeoLocationService } from '../../cd-geo/services/cd-geo-location.service';
import { Logging } from '../../../sys/base/winston.log';
import { Between, FindOperator, LessThan, MoreThan, Not } from 'typeorm';
import { UserModel } from '../../../sys/user/models/user.model';
import { GroupModel } from '../../../sys/user/models/group.model';
import { GroupService } from '../../../sys/user/services/group.service';
import { GroupMemberService } from '../../../sys/user/services/group-member.service';
import { GroupMemberModel } from '../../../sys/user/models/group-member.model';

export class CoopStatPublicFilterService extends CdService {
    logger: Logging;
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CoopStatPublicFilterModel;
    modelName: "CoopStatPublicFilterModel";
    sessModel;
    sessDataExt: ISessionDataExt;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['coopStatPublicFilterName', 'coopStatPublicFilterDescription'],
        noDuplicate: ['coopStatPublicFilterName']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.logger = new Logging();
        this.serviceModel = new CoopStatPublicFilterModel();
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
                   "CoopStatPublicFilterGuid":"",
                   "CoopStatPublicFilterName": "Benin", 
                   "CoopStatPublicFilterDescription":"2005",
                   "cdGeoLocationId":null,
                   "coopWoccu": false,
                   "coopCount": null,
                   "coopMembersCount": 881232, 
                   "coopSavesShares":56429394,
                   "coopLoans":45011150,
                   "coopReserves":null, 
                   "coopAssets": null,
                   "coopMemberPenetration":20.95,
                   "CoopStatPublicFilterDateLabel": "2005-12-31 23:59:59",
                   "CoopStatPublicFilterRefId":null
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
                serviceModel: CoopStatPublicFilterModel,
                modelName: "CoopStatPublicFilterModel",
                serviceModelInstance: this.serviceModel,
                docName: 'Create CoopStatPublicFilter',
                dSource: 1,
            }
            this.logger.logInfo('CoopStatPublicFilterService::create()/serviceInput:', serviceInput)
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
                serviceModel: CoopStatPublicFilterModel,
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

    async createI(req, res, createIParams: CreateIParams): Promise<CoopStatPublicFilterModel | boolean> {
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
                    "CoopStatPublicFilterGuid": "",
                    "CoopStatPublicFilterName": "Kenya",
                    "CoopStatPublicFilterDescription": "2006",
                    "cdGeoLocationId": null,
                    "coopWoccu": false,
                    "coopCount": 2993,
                    "coopMembersCount": 3265545,
                    "coopSavesShares": 1608009012,
                    "coopLoans": 1604043550,
                    "coopReserves": 102792479,
                    "coopAssets": 2146769999,
                    "coopMemberPenetration": 16.01,
                    "CoopStatPublicFilterDateLabel": "2006-12-31 23:59:59",
                    "CoopStatPublicFilterRefId": null
                },
                {
                    "CoopStatPublicFilterGuid": "",
                    "CoopStatPublicFilterName": "Malawi",
                    "CoopStatPublicFilterDescription": "2006",
                    "cdGeoLocationId": null,
                    "coopWoccu": false,
                    "coopCount": 70,
                    "coopMembersCount": 62736,
                    "coopSavesShares": 6175626,
                    "coopLoans": 4946246,
                    "coopReserves": 601936,
                    "coopAssets": 7407250,
                    "coopMemberPenetration": 0.9,
                    "CoopStatPublicFilterDateLabel": "2006-12-31 23:59:59",
                    "CoopStatPublicFilterRefId": null
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
        this.logger.logInfo('CoopStatPublicFilterService::createM()/01')
        let data = req.post.dat.f_vals[0].data
        this.logger.logInfo('CoopStatPublicFilterService::createM()/data:', data)
        // this.b.models.push(CoopStatPublicFilterModel)
        // this.b.init(req, res)

        for (var coopData of data) {
            this.logger.logInfo('coopData', coopData)
            const coopQuery: CoopStatPublicFilterModel = coopData;
            const svCoop = new CoopStatPublicFilterService();
            const si = {
                serviceInstance: svCoop,
                serviceModel: CoopStatPublicFilterModel,
                serviceModelInstance: svCoop.serviceModel,
                docName: 'CoopStatPublicFilterService::CreateM',
                dSource: 1,
            }
            const createIParams: CreateIParams = {
                serviceInput: si,
                controllerData: coopQuery
            }
            let ret = await this.createI(req, res, createIParams)
            this.logger.logInfo('CoopStatPublicFilterService::createM()/forLoop/ret:', { ret: ret })
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement 
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "CoopStatPublicFilterName",
            //     "CoopStatPublicFilterDescription"
            // ],
            "where": {},
            "take": 5,
            "skip": 0
        }
        this.getCoopStatPublicFilter(req, res, q)
    }

    async CoopStatPublicFilterExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::CoopExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        await this.b.setPlData(req, { key: 'coopStatPublicFilterGuid', value: this.b.getGuid() });
        await this.b.setPlData(req, { key: 'coopStatPublicFilterEnabled', value: true });
        return true;
    }

    async beforeCreateSL(req, res): Promise<any> {
        await this.b.setPlData(req, { key: 'coopStatPublicFilterGuid', value: this.b.getGuid() });
        await this.b.setPlData(req, { key: 'coopStatPublicFilterEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        // const serviceInput: IServiceInput = {
        //     serviceInstance: this,
        //     serviceModel: CoopStatPublicFilterModel,
        //     docName: 'CoopStatPublicFilterService::CoopExists',
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
        this.logger.logInfo('CoopStatPublicFilterService::getCoop/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('CoopStatPublicFilterService::read$()/r:', r)
                    this.b.i.code = 'CoopStatPublicFilterService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('CoopStatPublicFilterService::read$()/e:', e)
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
        // this.logger.logInfo('CoopStatPublicFilterService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // this.logger.logInfo('CoopStatPublicFilterService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    disableFilter(req, res) {
        // this.logger.logInfo('CoopStatPublicFilterService::update()/01');
        let q:IQuery = this.b.getQuery(req);
        // q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::disableFilter',
            cmd: {
                action: 'update',
                query: {
                    update: {
                        coopStatPublicFilterEnabled: 0
                    },
                    where: q.where
                }
            },
            dSource: 1
        }
        // this.logger.logInfo('CoopStatPublicFilterService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    enableFilter(req, res) {
        // this.logger.logInfo('CoopStatPublicFilterService::update()/01');
        let q:IQuery = this.b.getQuery(req);
        // q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::enableFilter',
            cmd: {
                action: 'update',
                query: {
                    update: {
                        coopStatPublicFilterEnabled: 1
                    },
                    where: q.where
                }
            },
            dSource: 1
        }
        // this.logger.logInfo('CoopStatPublicFilterService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    updateSL(req, res) {
        this.logger.logInfo('CoopStatPublicFilterService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        this.logger.logInfo('CoopStatPublicFilterService::update()/02')
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
        if('coopEnabled' in q.update){
            if (q.update.coopEnabled === '') {
                q.update.coopEnabled = null;
            }
            return q;
        }
        else if('coopStatPublicFilterEnabled' in q.update){
            return q;
        }
        else{
            return q;
        }
        
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
        this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/01')
        const svSess = new SessionService();


        ///////////////////////////////////////////////////////////////////
        // const plData: CoopStatPublicFilterModel = await this.b.getPlData(req)
        // if ('coopStatPublicFilterSpecs' in plData) {
        //     console.log("CoopStatPublicFilterService::beforeCreate()/plData:", plData)
        //     if (typeof plData.coopStatPublicFilterSpecs == 'object') {
        //         console.log("CoopStatPublicFilterService::beforeCreate()/plData.coopStatPublicFilterSpecs:", plData.coopStatPublicFilterSpecs)
        //         req.post.dat.f_vals[0].data.coopStatPublicFilterSpecs = JSON.stringify(plData.coopStatPublicFilterSpecs)
        //     }
        // }
        // const plData2: CoopStatPublicFilterModel = await this.b.getPlData(req)
        // console.log("CoopStatPublicFilterService::beforeCreate()/plData2:", plData2)
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CoopStatPublicFilterModel,
        }
        this.b.i.code = 'CoopStatPublicFilterService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/03')
                ret = true;
            } else {
                this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the coopTypeId referenced exists
        const pl: CoopStatPublicFilterModel = this.b.getPlData(req);
        if ('coopTypeId' in pl) {
            this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/07')
            this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/pl:', pl)
            const serviceInput = {
                serviceModel: CoopTypeModel,
                docName: 'CoopStatPublicFilterService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { coopTypeId: pl.coopTypeId } }
                },
                dSource: 1
            }
            this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/serviceInput:', { serviceInput: JSON.stringify(serviceInput) })
            const r: any = await this.b.read(req, res, serviceInput)
            this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/r:', r)
            if (r.length > 0) {
                this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/08')
                ret = true;
            } else {
                this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/10')
                ret = false;
                this.b.i.app_msg = `Coop type reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        }
        // error should only be invoked if 'coopTypeId' was also a requred field.
        else if (this.cRules.required.includes('coopTypeId')) {
            this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/11')
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `coopTypeId is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        this.logger.logInfo('CoopStatPublicFilterService::getCoop/12');
        if (this.b.err.length > 0) {
            this.logger.logInfo('coop/CoopStatPublicFilterService::validateCreate()/13')
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
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "Coops","c": "Coop","a": "Get","dat": {"f_vals": [{"query": {"where": {"CoopStatPublicFilterName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     * @param q 
     */
    async getCoopStatPublicFilter(req, res, q: IQuery = null): Promise<any> {

        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CoopStatPublicFilterService::getCoop/f:', q);
        // const serviceInput = siGet(q,this)
        this.serviceModel = new CoopStatPublicFilterModel();
        const serviceInput: IServiceInput = this.b.siGet(q, this)
        serviceInput.serviceModelInstance = this.serviceModel
        serviceInput.serviceModel = CoopStatPublicFilterModel
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            this.logger.logInfo('CoopStatPublicFilterService::read$()/e:', e)
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
    async getCoopStatPublicFilters(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CoopStatPublicFilterService::getCoopStatPublicFilters/q:', q);
        const serviceInput = siGet(q, this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            this.logger.logInfo('CoopStatPublicFilterService::read$()/e:', e)
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

    async getCoopStatPublicFilterSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopStatPublicFilterService::getCoop/q:', q);
        const serviceInput = siGet(q, this)
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('CoopStatPublicFilterService::read$()/r:', r)
                    this.b.i.code = 'CoopStatPublicFilterService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('CoopStatPublicFilterService::read$()/e:', e)
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
    getCoopStatPublicFilterType(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopStatPublicFilterService::getCoopStatPublicFilterType/f:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopStatPublicFilterService::getCoopStatPublicFilterType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('CoopStatPublicFilterService::read$()/r:', r)
                    this.b.i.code = 'getCoopStatPublicFilterType::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('CoopStatPublicFilterService::read$()/e:', e)
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
    getCoopStatPublicFilterPaged(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopStatPublicFilterService::getCoopPaged/q:', q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::getCoopPaged$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopStatPublicFilterService::Get';
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
        this.logger.logInfo('CoopStatPublicFilterService::getPagedSL()/q:', q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::getPagedSL',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopStatPublicFilterService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    getCoopStatPublicFilterTypeCount(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CoopStatPublicFilterService::getCoopStatPublicFilterTypeCount/q:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopStatPublicFilterService::getCoopStatPublicFilterTypeCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopStatPublicFilterService::readCount$';
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
        this.logger.logInfo('CoopStatPublicFilterService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::delete',
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
        this.logger.logInfo('CoopStatPublicFilterService::deleteSL()/q:', q)
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::deleteSL',
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
    async getCoopStatPublicFilterI(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CoopStatPublicFilterService::getCoopStatPublicFilterI/q:', q);
        let serviceModel = new CoopStatPublicFilterModel();
        const serviceInput: IServiceInput = this.b.siGet(q, this)
        serviceInput.serviceModelInstance = serviceModel
        serviceInput.serviceModel = CoopStatPublicFilterModel
        try {
            let respData = await this.b.read(req, res, serviceInput)
            return { data: respData, error: null }
        } catch (e) {
            this.logger.logInfo('CoopStatPublicFilterService::getCoopStatPublicFilterI()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BCoopStatPublicFilterService::getCoopStatPublicFilterI()/e:',
                app_msg: ''
            };
            return { data: null, error: e }
        }
    }

    /**
     * 
     * This filter is meant to be applied against an in coming query for 
     * coopStat. 
     * Additional filters will be applied as per array settings hosted in 
     * coopStatPublicFilter in the coopStatPublicFilterSpecs JSON field
     * The setting also optionally include exemptions for selected users and groups
     * 
     * @param req 
     * @param res 
     * @param q 
     * @returns 
     */
    async applyCoopStatFilter(req, res, q: IQuery): Promise<IQuery> {
        console.log("CoopStatPublicFilterService::applyCoopStatFilter()/BeforeFilter/q:", q);
        const svSess = new SessionService();
        const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true);
        console.log("CoopMemberService::applyCoopStatFilter()/sessionDataExt:", sessionDataExt);

        const currentUser = sessionDataExt.currentUser;
        console.log("CoopMemberService::applyCoopStatFilter()/currentUser:", currentUser);

        const svGroupMember = new GroupMemberService();
        const userGroups: GroupMemberModel[] = await svGroupMember.getUserGroupsI(req, res, currentUser.userGuid);
        console.log("CoopMemberService::applyCoopStatFilter()/userGroups:", userGroups);

        const qCoopStatPublicFilterSpecs = { where: { coopStatPublicFilterEnabled: true } };
        const existingFilters = await this.getCoopStatPublicFilterSpecsI(req, res, qCoopStatPublicFilterSpecs);
        console.log("CoopMemberService::applyCoopStatFilter()/existingFilters:", existingFilters);

        if (!existingFilters || existingFilters.data.length === 0) {
            console.log("No filters applied as no existing filters found.");
            return q;
        }

        q.where = q.where || {};

        for (const f of existingFilters.data) {
            const filter = f.coopStatPublicFilterSpecs;

            const isExempted = await this.userIsExempted(req, res, filter, currentUser, userGroups);
            console.log("CoopMemberService::applyCoopStatFilter()/isExempted:", isExempted);

            if (isExempted) {
                console.log("User or group exempted from filter:", filter);
                continue;
            }

            if ('coopTypeId' in filter.where) {
                q.where.coopTypeId = Not(filter.where.coopTypeId);
            }

            if ('coopStatRefId' in filter.where) {
                q.where.coopStatRefId = Not(filter.where.coopStatRefId);
            }

            if ('cdGeoLocationId' in filter.where) {
                q.where.cdGeoLocationId = Not(filter.where.cdGeoLocationId);
            }

            if ('cdGeoPoliticalTypeId' in filter.where) {
                q.where.cdGeoPoliticalTypeId = Not(filter.where.cdGeoPoliticalTypeId);
            }

            if ('coopStatDateLabel' in filter.where) {
                const dateLabel = filter.where.coopStatDateLabel;

                if (typeof dateLabel === 'string' && dateLabel.includes('%<')) {
                    const dateValue = dateLabel.split('%<')[1];
                    q.where.coopStatDateLabel = LessThan(new Date(dateValue));
                } else if (typeof dateLabel === 'string' && dateLabel.includes('%>')) {
                    const dateValue = dateLabel.split('%>')[1];
                    q.where.coopStatDateLabel = MoreThan(new Date(dateValue));
                } else if (typeof dateLabel === 'string' && dateLabel.includes('%BETWEEN')) {
                    const [start, end] = dateLabel.split('%BETWEEN')[1].split(',');
                    q.where.coopStatDateLabel = Between(new Date(start), new Date(end));
                }
            }
        }

        // Remove fields with _value: null from q.where
        q.where = this.cleanWhereClause(q.where);

        console.log("Filters applied to the where clause:", q.where);
        console.log("CoopStatPublicFilterService::applyCoopStatFilter()/AfterFilter/q:", q);
        return q;
    }

    /**
     * Recursively removes properties in the `where` object where `_value: null`.
     */
    cleanWhereClause(where: any): any {
        if (typeof where !== 'object' || where === null) {
            return where;
        }

        // Handle arrays
        if (Array.isArray(where)) {
            return where.map(this.cleanWhereClause).filter((item) => item !== undefined);
        }

        // Handle objects
        const cleanedWhere = {};
        for (const [key, value] of Object.entries(where)) {
            if (value instanceof FindOperator) {
                // Access the value using the public `value` getter
                if (value.value !== null) {
                    cleanedWhere[key] = value;
                }
            } else if (typeof value === 'object') {
                // Recursively clean nested objects
                const nested = this.cleanWhereClause(value);
                if (nested !== undefined) {
                    cleanedWhere[key] = nested;
                }
            } else if (value !== null) {
                // Directly add non-null values
                cleanedWhere[key] = value;
            }
        }

        // Return the cleaned object or undefined if all properties are removed
        return Object.keys(cleanedWhere).length > 0 ? cleanedWhere : undefined;
    }

    async getCoopStatPublicFilterSpecsI(req, res, q: IQuery = null) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CoopStatPublicFilterService::getCoopStatPublicFilterI/q:', q);
        let serviceModel = new CoopStatPublicFilterModel();
        const serviceInput: IServiceInput = this.b.siGet(q, this)
        serviceInput.serviceModelInstance = serviceModel
        serviceInput.serviceModel = CoopStatPublicFilterModel
        try {
            let respData = await this.b.read(req, res, serviceInput)
            return { data: respData, error: null }
        } catch (e) {
            this.logger.logInfo('CoopStatPublicFilterService::getCoopStatPublicFilterI()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BCoopStatPublicFilterService::getCoopStatPublicFilterI()/e:',
                app_msg: ''
            };
            return { data: null, error: e }
        }
    }

    async userIsExempted(
        req: Request,
        res: Response,
        existingFilter: coopStatPublicFilterSpecs,
        currentUser: UserModel,
        userGroups: GroupMemberModel[],
    ): Promise<boolean> {

        console.log('CoopStatPublicFilterService::userIsExempted()/currentUser:', currentUser)
        console.log('CoopStatPublicFilterService::userIsExempted()/userGroups:', userGroups)
        console.log('CoopStatPublicFilterService::userIsExempted()/existingFilter:', existingFilter)
        // Check if user is directly exempted
        const isUserExempted = existingFilter.exempted.some(item =>
            item.cdObjTypeId === 9 && item.cdObjId === currentUser.userId
        );
        console.log('CoopStatPublicFilterService::userIsExempted()/isUserExempted:', isUserExempted)

        // Check if any of the user's groups are exempted
        const isGroupExempted = userGroups.some(group =>
            existingFilter.exempted.some(item =>
                item.cdObjTypeId === 10 && item.guid === group.groupGuidParent
            )
        );
        console.log('CoopStatPublicFilterService::userIsExempted()/isGroupExempted:', isGroupExempted)

        return isUserExempted || isGroupExempted;
    }


    /**
     * get data by geo-location
     * 1. get data from n selected locations
     * 2. list countries queried
     * 3. derive polulation data from geoLocation data
     * @param req 
     * @param res 
     */
    async StatsByGeoLocation(req, res, q: IQuery = null) {
        if (q === null) {
            q = this.b.getQuery(req);
        }

        let svCdGeoLocationService = new CdGeoLocationService()
        let gData = await svCdGeoLocationService.getGeoLocationI(req, res, q)

        // ,"order": {"CoopStatPublicFilterDateLabel": "ASC"}
        q.order = { "CoopStatPublicFilterDateLabel": "ASC" }
        let cData = await this.getCoopStatPublicFilterI(req, res, q)
        let ret = {
            geoLocationData: gData.data,
            coopData: cData.data,
        }
        this.logger.logInfo('CoopStatPublicFilterService::StatsByGeoLocation()/ret:', ret)
        this.b.cdResp.data = await ret;
        this.b.respond(req, res)
    }

}
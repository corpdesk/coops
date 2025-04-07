import { BaseService } from '../../../sys/base/base.service';
import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser, ICdRequest, ISessionDataExt } from '../../../sys/base/IBase';
import { CoopModel } from '../models/coop.model';
// import { CoopViewModel, siGet } from '../models/coop-view.model';
import { CoopTypeModel } from '../models/coop-type.model';
import { CoopViewModel } from '../models/coop-view.model';
import { siGet } from '../../../sys/base/base.model';
import { CdGeoLocationService } from '../../cd-geo/services/cd-geo-location.service';
import { Logging } from '../../../sys/base/winston.log';
import { CompanyService } from '../../../sys/moduleman/services/company.service';
import { CompanyModel } from '../../../sys/moduleman/models/company.model';
import { CdGeoLocationModel } from '../../cd-geo/models/cd-geo-location.model';
import { CoopMemberModel, coopMemberProfileDefault, ICoopMemberProfile } from '../models/coop-member.model';
import { IUserProfile, userProfileDefault } from '../../../sys/user/models/user.model';
import { CoopMemberViewModel } from '../models/coop-member-view.model';
import { Like, Not } from 'typeorm';
import { QueryTransformer } from '../../../sys/utils/query-transformer';
import { safeStringify } from '../../../sys/utils/safe-stringify';

export class CoopService extends CdService {
    logger: Logging;
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CoopModel;
    modelName: "CoopModel";
    sessModel;
    sessDataExt: ISessionDataExt;
    // moduleModel: ModuleModel;
    arrLikeConditions: any[] = [];
    /*
     * create rules
     */
    cRules: any = {
        required: ['coopName', 'coopTypeId'],
        noDuplicate: ['coopName', 'coopTypeId']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.logger = new Logging();
        this.serviceModel = new CoopModel();
    }

    async initSession(req, res) {
        const svSess = new SessionService();
        this.sessDataExt = await svSess.getSessionDataExt(req, res);
    }

    /**
     * Create from new company:
     *  - Create company, then create coop
     * 
     * Create from existing company
     *  - select company then create coop
    * {
       "ctx": "App",
       "m": "Coops",
       "c": "Coop",
       "a": "Create",
       "dat": {
           "f_vals": [
           {
               "data": {
                   "coopGuid":"",
                   "coopName": "Benin", 
                   "coopDescription":"2005",
                   "cdGeoLocationId":null,
                   "coopWoccu": false,
                   "coopCount": null,
                   "coopMembersCount": 881232, 
                   "coopSavesShares":56429394,
                   "coopLoans":45011150,
                   "coopReserves":null, 
                   "coopAssets": null,
                   "coopMemberPenetration":20.95,
                   "coopDateLabel": "2005-12-31 23:59:59",
                   "coopRefId":null
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
                serviceModel: CoopModel,
                modelName: "CoopModel",
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

    async validateCreate(req, res) {
        this.logger.logInfo('coop/CoopService::validateCreate()/01');
        const svSess = new SessionService();
        // const svCompany = new CompanyService();
        let companyParams;

        // const fValItem = req.body.dat.f_vals[0];
        let pl: CoopModel = this.b.getPlData(req);
        console.log("CoopService::validateCreate()/pl:", pl)

        // Validation params for the different checks
        const validationParams = [
            {
                field: 'coopTypeId',
                query: { coopTypeId: pl.coopTypeId },
                model: CoopTypeModel
            },
            {
                field: 'cdGeoLocationId',
                query: { cdGeoLocationId: pl.cdGeoLocationId },
                model: CdGeoLocationModel
            }
        ];

        if ('companyId' in pl) {
            companyParams = {
                field: 'companyId',
                query: { companyId: pl.companyId },
                model: CompanyModel
            }
            validationParams.push(companyParams)
        }

        const valid = await this.validateExistence(req, res, validationParams);

        if (!valid) {
            this.logger.logInfo('coop/CoopService::validateCreate()/Validation failed');
            this.b.setAppState(false, this.b.i, svSess.sessResp);
            return false;
        }

        // Proceed with further Coop-specific validation or creation logic
        this.logger.logInfo('coop/CoopService::validateCreate()/Validation passed');

        // Other validation logic (e.g., duplicate checks, required field checks, etc.)

        return true;
    }

    async validateExistence(req, res, validationParams) {
        const promises = validationParams.map(param => {
            const serviceInput = {
                serviceModel: param.model,
                docName: `CoopService::validateExistence(${param.field})`,
                cmd: {
                    action: 'find',
                    query: { where: param.query }
                },
                dSource: 1
            };
            console.log("CoopService::validateExistence/param.model:", param.model);
            console.log("CoopService::validateExistence/serviceInput:", JSON.stringify(serviceInput));
            const b = new BaseService();
            return b.read(req, res, serviceInput).then(r => {
                if (r.length > 0) {
                    this.logger.logInfo(`coop/CoopService::validateExistence() - ${param.field} exists`);
                    return true;
                } else {
                    this.logger.logError(`coop/CoopService::validateExistence() - Invalid ${param.field}`);
                    this.b.i.app_msg = `${param.field} reference is invalid`;
                    this.b.err.push(this.b.i.app_msg);
                    return false;
                }
            });
        });

        const results = await Promise.all(promises);

        // If any of the validations fail, return false
        return results.every(result => result === true);
    }

    async createSL(req, res) {
        const svSess = new SessionService();
        await this.b.initSqlite(req, res)
        if (await this.validateCreateSL(req, res)) {
            await this.beforeCreateSL(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CoopModel,
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

    async createI(req, res, createIParams: CreateIParams): Promise<CoopModel | boolean> {
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
                    "coopGuid": "",
                    "coopName": "Kenya",
                    "coopDescription": "2006",
                    "cdGeoLocationId": null,
                    "coopWoccu": false,
                    "coopCount": 2993,
                    "coopMembersCount": 3265545,
                    "coopSavesShares": 1608009012,
                    "coopLoans": 1604043550,
                    "coopReserves": 102792479,
                    "coopAssets": 2146769999,
                    "coopMemberPenetration": 16.01,
                    "coopDateLabel": "2006-12-31 23:59:59",
                    "coopRefId": null
                },
                {
                    "coopGuid": "",
                    "coopName": "Malawi",
                    "coopDescription": "2006",
                    "cdGeoLocationId": null,
                    "coopWoccu": false,
                    "coopCount": 70,
                    "coopMembersCount": 62736,
                    "coopSavesShares": 6175626,
                    "coopLoans": 4946246,
                    "coopReserves": 601936,
                    "coopAssets": 7407250,
                    "coopMemberPenetration": 0.9,
                    "coopDateLabel": "2006-12-31 23:59:59",
                    "coopRefId": null
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
        // this.b.models.push(CoopModel)
        // this.b.init(req, res)

        for (var coopData of data) {
            this.logger.logInfo('coopData', coopData)
            const coopQuery: CoopModel = coopData;
            const svCoop = new CoopService();
            const si = {
                serviceInstance: svCoop,
                serviceModel: CoopModel,
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
            //     "coopName",
            //     "coopDescription"
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
            serviceModel: CoopModel,
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
        /**
         * create can be processed from existing or new company
         * In case of new company, setCompanyId() saves and use the id to set companyId for coop
         */
        await this.setCompanyId(req, res)

        this.b.setPlData(req, { key: 'coopGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'coopEnabled', value: true });
        return true;
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'coopGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'coopEnabled', value: true });
        return true;
    }

    async setCompanyId(req, res) {
        const svCompany = new CompanyService();
        if ('extData' in req.post.dat.f_vals[0]) {
            if ('company' in req.post.dat.f_vals[0].extData) {
                const si = {
                    serviceInstance: svCompany,
                    serviceModel: CompanyModel,
                    serviceModelInstance: svCompany.serviceModel,
                    docName: 'CoopService/beforeCreate',
                    dSource: 1,
                }
                const createIParams: CreateIParams = {
                    serviceInput: si,
                    controllerData: req.post.dat.f_vals[0].extData.company
                }
                // Call CompanyService to create a new company
                const c: any = await svCompany.createI(req, res, createIParams);
                this.b.setPlData(req, { key: 'companyId', value: c.companyId });
            }
        }
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        // const serviceInput: IServiceInput = {
        //     serviceInstance: this,
        //     serviceModel: CoopModel,
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
            serviceModel: CoopModel,
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
            serviceModel: CoopModel,
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

    async validateCreateSL(req, res) {
        return true;
    }

    /**
     * 
     * curl test:
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "Coops","c": "Coop","a": "Get","dat": {"f_vals": [{"query": {"where": {"coopName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
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
        this.serviceModel = new CoopModel();
        const serviceInput: IServiceInput = this.b.siGet(q, this)
        serviceInput.serviceModelInstance = this.serviceModel
        serviceInput.serviceModel = CoopModel
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
    async getCoops(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CoopService::getCoops/q:', q);
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

    /////////////////////////////////////////////////////////////////////////////////////////
    // Fetch all enabled CoopTypes
    async getCoopType2(req: any, res: any): Promise<void> {
        const q = this.b.getQuery(req);
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CoopTypeModel,
            docName: 'CoopTypeService::getCoopType2',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };

        const dbResult = await this.b.read2(req, res, serviceInput);
        this.b.i.code = 'CoopTypeService::getCoopType2';
        const svSess = new SessionService();
        svSess.sessResp.cd_token = req.post.dat.token;
        svSess.sessResp.ttl = svSess.getTtl();
        this.b.setAppState(true, this.b.i, svSess.sessResp);
        this.b.cdResp.data = dbResult;
        this.b.respond(req, res)
    }

    // Search CoopTypes with dynamic filtering
    async searchCoopTypes(req: any, res: any): Promise<void> {
        try {

            await this.transformSearchQuery(req, res)
            // const take = 10; // Limit
            // const skip = 0;  // Offset

            const serviceInput: IServiceInput = {
                serviceInstance: this,
                serviceModel: CoopTypeModel,
                docName: 'CoopTypeService::searchCoopTypes',
                cmd: {
                    action: 'find',
                    query: {
                        where: this.arrLikeConditions,
                    },
                },
                dSource: 1,
            };

            console.log("CoopTypeService::searchCoopTypes()/serviceInput.cmd.query:", serviceInput.cmd.query);

            const dbResult = await this.b.read2(req, res, serviceInput);
            this.b.i.code = 'CoopTypeService::searchCoopTypes';
            const svSess = new SessionService();
            svSess.sessResp.cd_token = req.post.dat.token;
            svSess.sessResp.ttl = svSess.getTtl();
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = dbResult;
            this.b.respond(req, res);
        } catch (e) {
            this.logger.logInfo('CoopTypeService::searchCoopTypes()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopTypeService::searchCoopTypes',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code);
            this.b.respond(req, res);
        }
    }

    async transformSearchQuery(req, res) {
        const q: IQuery = this.b.getPlQuery(req);
        const tq = QueryTransformer.transformQuery(q)
        const COOP_TYPE_SEARCH_FIELDS = tq.searchFields;
        const searchTerm = tq.searchTerm;
        COOP_TYPE_SEARCH_FIELDS.forEach(field => {
            this.arrLikeConditions.push({ [field]: Like(`%${searchTerm}%`) });
        });
    }


    // Utility: Generate OR conditions for a search term and fields
    orConditions(searchTerm: string, fields: string[]): any[] {
        return fields.map(field => ({
            [field]: `%${searchTerm}%`,
        }));
    }

    // Utility: Add additional OR conditions to existing conditions
    addOrConditions(where: any[], extraConditions: { [key: string]: any }): any[] {
        return where.map(condition => ({
            ...condition,
            ...extraConditions,
        }));
    }
    //////////////////////////////////////////////////////////////////////////////////////////

    getCdObjTypeCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CoopService::getCdObjCount/q:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopService::getCdObjCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopService::getCdObjTypeCount';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
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
            serviceModel: CoopViewModel,
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

    getCoopQB(req, res) {
        console.log('CoopService::getCoopQB()/1')
        this.b.entityAdapter.registerMappingFromEntity(CoopViewModel);
        const q = this.b.getQuery(req);
        const serviceInput = {
            serviceModel: CoopViewModel,
            docName: 'CoopService::getCoopQB',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }

        this.b.readQB$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = serviceInput.docName;
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
            serviceModel: CoopModel,
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
            serviceModel: CoopModel,
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
            serviceModel: CoopModel,
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
        let serviceModel = new CoopViewModel();
        const serviceInput: IServiceInput = this.b.siGet(q, this)
        serviceInput.serviceModelInstance = serviceModel
        serviceInput.serviceModel = CoopViewModel
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
    async StatsByGeoLocation(req, res, q: IQuery = null) {
        if (q === null) {
            q = this.b.getQuery(req);
        }

        let svCdGeoLocationService = new CdGeoLocationService()
        let gData = await svCdGeoLocationService.getGeoLocationI(req, res, q)

        // ,"order": {"coopDateLabel": "ASC"}
        q.order = { "coopDateLabel": "ASC" }
        let cData = await this.getCoopI(req, res, q)
        let ret = {
            geoLocationData: gData.data,
            coopData: cData.data,
        }
        this.logger.logInfo('CoopService::StatsByGeoLocation()/ret:', ret)
        this.b.cdResp.data = await ret;
        this.b.respond(req, res)
    }

    async getCoopMemberI(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CoopService::getCoopMemberI/q:', q);
        let serviceModel = new CoopMemberViewModel();
        const serviceInput: IServiceInput = this.b.siGet(q, this)
        serviceInput.serviceModelInstance = serviceModel
        serviceInput.serviceModel = CoopMemberViewModel
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

    //////////////////////////////////////////////////////////////////////////////////////////////////
    // STARTING MEMBER PROFILE FEATURES
    // Public method to update user member profile (e.g., avatar, bio)
    async updateCurrentMemberProfile(req, res) {
        const svSession = new SessionService();
        try {
            // const session = await svSession.getSession(req, res);
            // const userId = session[0].currentUserId;
            // const pl:CoopMemberModel = this.b.getPlData(req)
            // const q = {where: {userId: userId,coopId: pl.coopId}}
            // const coopMember = this.getCoopMemberI(req, res, q)
            const updatedProfile = this.b.getPlData(req);  // Extract payload data

            // Validate input
            const validProfile = await this.validateProfileData(updatedProfile);

            if (validProfile) {
                // Prepare serviceInput for BaseService methods
                const serviceInput: IServiceInput = {
                    serviceInstance: this,
                    serviceModel: CoopMemberModel,
                    docName: 'CoopMemberService::updateCurrentMemberProfile',
                    cmd: {
                        query: updatedProfile
                    }
                };

                // Update user member profile using BaseService's updateJSONColumnQB method
                const result = await this.b.updateJSONColumnQB(req, res, serviceInput, 'user member profile', updatedProfile);

                // Respond to API caller
                // return await this.b.respond(req, res, { success: true, data: result });
                this.b.cdResp.data = result;
                return await this.b.respond(req, res)
            } else {
                // return await this.b.respond(req, res, { success: false, message: "Invalid profile data" });
                const e = "Invalid profile data"
                this.logger.logInfo('UserService::read$()/e:', { error: e })
                this.b.err.push(e.toString());
                const i = {
                    messages: this.b.err,
                    code: 'UserService:updateProfile',
                    app_msg: ''
                };
                await this.b.serviceErr(req, res, e, i.code)
                await this.b.respond(req, res)
            }

        } catch (e) {
            this.logger.logInfo('UserService::read$()/e:', { error: e })
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'UserService:updateProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getUserProfile(req, res) {
        try {
            const pl = this.b.getPlData(req)
            const userId = pl.userId;

            // Retrieve the user member profile using an internal method
            const profile = await this.getUserProfileI(req, res, userId);

            // Respond with the retrieved profile data
            this.b.cdResp.data = profile;
            return await this.b.respond(req, res);
        } catch (e) {
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'UserService:getProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }

    // Public method to get a user member profile
    async getCurrentMemberProfile(req, res) {
        try {
            const svSession = new SessionService()
            const session = await svSession.getSession(req, res);
            const userId = session[0].currentUserId;
            console.log("UserServices::getCurrentMemberProfile9)/userId:", userId)
            // Retrieve the user member profile using an internal method
            const profile = await this.getUserProfileI(req, res, userId);

            // Respond with the retrieved profile data
            this.b.cdResp.data = profile;
            return await this.b.respond(req, res);
        } catch (e) {
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'UserService:getProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }

    // Internal method to retrieve user member profile
    async getUserProfileI(req, res, coopMemberId: number): Promise<ICoopMemberProfile | null> {
        try {
            // // Use BaseService to retrieve user member profile
            // const result = await this.b.read(req, res, serviceInput);
            // const user = await this.getCoopMemberI(userId)
            const q = { where: { coopMemberId: coopMemberId } }
            const coopMember: CoopMemberViewModel[] = await this.getCoopMemberI(req, res, q)
            if (coopMember && coopMember[0].coopMemberProfile) {
                let coopMemberProfileJSON: ICoopMemberProfile = JSON.parse(coopMember[0].coopMemberProfile)

                if ('coopMemberData' in coopMemberProfileJSON) {
                    // profile data is valid

                    // update with latest user data
                    coopMemberProfileJSON[0].coopMemberData = coopMember

                } else {
                    // profile data is not set, so set it from default
                    coopMemberProfileJSON = coopMemberProfileDefault
                    /**
                     * this stage should be modified to
                     * filter data based on pwermission setting
                     * permission data can further be relied on
                     * by the front end for hidden or other features of accessibility
                     * to user member profile data.
                     * This mechanism can be applied to all corpdesk resources
                     */
                    coopMemberProfileJSON[0].coopMemberData = coopMember
                }
                return coopMemberProfileJSON;  // Parse the JSON field

            } else {
                return null;
            }

        } catch (e) {
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'UserService:getProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }

    // Internal method to handle profile updates
    async updateUserProfileI(req, res, userId: string, newProfileData: Partial<IUserProfile>) {
        try {
            // Use BaseService method to handle JSON updates for user member profile field
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CoopMemberModel,
                docName: 'CoopMemberService::updateUserProfileI',
                cmd: {
                    query: newProfileData
                    // query: {
                    //     where: { user_id: userId },
                    //     update: { user member profile: newProfileData }
                    // }
                }
            };

            await this.b.updateJSONColumnQB(req, res, serviceInput, 'user member profile', newProfileData);
            return newProfileData;  // Return updated profile
        } catch (error) {
            throw new Error(`Error updating user member profile: ${error.message}`);
        }
    }

    // Helper method to validate profile data
    validateProfileData(profileData: Partial<IUserProfile>): boolean {
        // Example validation for bio length
        if (profileData.bio && profileData.bio.length > 500) {
            return false;  // Bio is too long
        }
        return true;
    }


    // Internal helper method to get a user by ID
    // async getCoopMemberByIdI(userId: number) {
    //     return await this.db.user.findOne({ where: { user_id: userId } });
    // }
}

function transformed(q: IQuery) {
    throw new Error('Function not implemented.');
}

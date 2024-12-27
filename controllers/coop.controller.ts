import { BaseService } from '../../../sys/base/base.service';
import { CoopTypeService } from '../services/coop-type.service';
import { CoopService } from '../services/coop.service';

export class CoopController {

    b: BaseService;
    svCoop: CoopService;
    svCoopType: CoopTypeService

    constructor() {
        this.b = new BaseService();
        this.svCoop = new CoopService();
        this.svCoopType = new CoopTypeService();


    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Coop",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "coopStatName": "/src/CdApi/sys/moduleman",
    //                         "CoopTypeId": "7ae902cd-5bc5-493b-a739-125f10ca0268",
    //                         "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b"
    //                     }
    //                 }
    //             ],
    //             "token": "3ffd785f-e885-4d37-addf-0e24379af338"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    async Create(req, res) {
        try {
            await this.svCoop.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCoop.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCoop.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:CreateSL');
        }
    }

    

    /**
     * {
            "ctx": "App",
            "m": "Coops",
            "c": "Coop",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"coopStatName": "Kenya"}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "Coops","c": "Coop","a": "Get","dat": {"f_vals": [{"query": {"where": {"coopStatName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Get(req, res) {
        try {
            await this.svCoop.getCoop(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCoop.getCoopSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "Coops",
            "c": "Coop",
            "a": "GetType",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"coopTypeId": 100}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "GetType","dat":{"f_vals": [{"query":{"where": {"coopTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async GetType(req, res) {
        try {
            // await this.svCoop.getCoopType(req, res);
            await this.svCoop.getCdObjTypeCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:Get');
        }
    }

    async GetType2(req, res) {
        try {
            // await this.svCoop.getCoopType(req, res);
            await this.svCoop.getCoopType2(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:GetType2');
        }
    }

    async SearchCoopTypes(req, res) {
        try {
            // await this.svCoop.getCoopType(req, res);
            await this.svCoop.searchCoopTypes(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:GetType2');
        }
    }

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "Coops",
            "c": "Coop",
            "a": "GetCount",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["coopStatId","coopStatGuid"],
                            "where": {},
                            "take": 5,
                            "skip": 1
                            }
                    }
                ],
                "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
            },
            "args": null
        }

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "GetCount","dat": {"f_vals": [{"query": {"select":["coopStatId","coopStatGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetCount(req, res) {
        try {
            await this.svCoop.getCoopQB(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:GetCount');
        }
    }

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "Coops",
            "c": "Coop",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["coopStatId","coopStatGuid"],
                            "where": {},
                            "take": 5,
                            "skip": 1
                            }
                    }
                ],
                "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
            },
            "args": null
        }

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "GetPaged","dat": {"f_vals": [{"query": {"select":["coopStatId","coopStatGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetPaged(req, res) {
        try {
            await this.svCoop.getCoopPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCoop.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "Coops",
            "c": "Coop",
            "a": "Update",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": {
                                "coopAssets": null
                            },
                            "where": {
                                "coopStatId": 1
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "Update","dat": {"f_vals": [{"query": {"update": {"coopAssets": null},"where": {"coopStatId": 1}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Update(req, res) {
        console.log('CoopController::Update()/01');
        try {
            console.log('CoopController::Update()/02');
            await this.svCoop.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CoopController::UpdateSL()/01');
        try {
            console.log('CoopController::UpdateSL()/02');
            await this.svCoop.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:UpdateSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "Coops",
            "c": "Coop",
            "a": "Delete",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"coopStatId": 69}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "Delete","dat": {"f_vals": [{"query": {"where": {"coopStatId": 69}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Delete(req, res) {
        try {
            await this.svCoop.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCoop.deleteSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    /**
     * 
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "CreateType","dat": {"f_vals": [{"data": {"coopTypeName": "Continental Apex"}}],"token": "3ffd785f-e885-4d37-addf-0e24379af338"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    async CreateType(req, res) {
        try {
            await this.svCoopType.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:CreateType');
        }
    }

    /**
     * 
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "UpudateType","dat": {"f_vals": [{"data": {"coopTypeName": "Continental Apex"}}],"token": "3ffd785f-e885-4d37-addf-0e24379af338"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    async UpdateType(req, res) {
        try {
            await this.svCoopType.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:EditType');
        }
    }

    /**
     * 
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "DeleteType","dat": {"f_vals": [{"query": {"where": {"coopTypeId": 107}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    async DeleteType(req, res) {
        try {
            await this.svCoopType.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopController:DeleteType');
        }
    }

}
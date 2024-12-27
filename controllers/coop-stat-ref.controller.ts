import { BaseService } from '../../../sys/base/base.service';
import { CoopTypeService } from '../services/coop-type.service';
import { CoopStatRefService } from '../services/coop-stat-ref.service';

export class CoopStatRefController {

    b: BaseService;
    svCoopStatRef: CoopStatRefService;
    svCoopType: CoopTypeService

    constructor() {
        this.b = new BaseService();
        this.svCoopStatRef = new CoopStatRefService();
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
            await this.svCoopStatRef.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCoopStatRef.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCoopStatRef.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:CreateSL');
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
            await this.svCoopStatRef.getCoopStatRef(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCoopStatRef.getCoopStatRefSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:GetSL');
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
            await this.svCoopStatRef.getCoopStatRefType(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:Get');
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
            await this.svCoopStatRef.getCoopStatRefPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopRetController:Get');
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
            await this.svCoopStatRef.getCoopStatRefPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopRetController:GetPaged');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCoopStatRef.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:GetPaged');
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
        console.log('CoopStatRefController::Update()/01');
        try {
            console.log('CoopStatRefController::Update()/02');
            await this.svCoopStatRef.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopRetController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CoopStatRefController::UpdateSL()/01');
        try {
            console.log('CoopStatRefController::UpdateSL()/02');
            await this.svCoopStatRef.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:UpdateSL');
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
            await this.svCoopStatRef.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopRetController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCoopStatRef.deleteSL(req, res);
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
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:CreateType');
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
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:EditType');
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
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:DeleteType');
        }
    }

    async GetStats(req, res) {
        try {
            await this.svCoopStatRef.getCoopStatRefs(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:GetStats');
        }
    }

    async StatsByGeoLocation(req, res) {
        try {
            await this.svCoopStatRef.StatsByGeoLocation(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatRefController:StatsByGeoLocation');
        }
    }

}
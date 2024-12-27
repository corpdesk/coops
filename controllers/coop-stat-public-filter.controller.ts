import { BaseService } from '../../../sys/base/base.service';
import { CoopTypeService } from '../services/coop-type.service';
import { CoopStatPublicFilterService } from '../services/coop-stat-public-filter.service';

export class CoopStatPublicFilterController {

    b: BaseService;
    svCoopStatPublicFilter: CoopStatPublicFilterService;
    svCoopType: CoopTypeService

    constructor() {
        this.b = new BaseService();
        this.svCoopStatPublicFilter = new CoopStatPublicFilterService();
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
            await this.svCoopStatPublicFilter.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCoopStatPublicFilter.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCoopStatPublicFilter.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:CreateSL');
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
            await this.svCoopStatPublicFilter.getCoopStatPublicFilter(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCoopStatPublicFilter.getCoopStatPublicFilterSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:GetSL');
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
            await this.svCoopStatPublicFilter.getCoopStatPublicFilterType(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:Get');
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
            await this.svCoopStatPublicFilter.getCoopStatPublicFilterPaged(req, res);
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
            await this.svCoopStatPublicFilter.getCoopStatPublicFilterPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopRetController:GetPaged');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCoopStatPublicFilter.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:GetPaged');
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
        console.log('CoopStatPublicFilterController::Update()/01');
        try {
            console.log('CoopStatPublicFilterController::Update()/02');
            await this.svCoopStatPublicFilter.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopRetController:Update');
        }
    }

    async EnableFilter(req, res) {
        console.log('CoopStatPublicFilterController::EnableFilter()/01');
        try {
            console.log('CoopStatPublicFilterController::EnableFilter()/02');
            await this.svCoopStatPublicFilter.enableFilter(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopRetController:EnableFilter');
        }
    }

    async DisableFilter(req, res) {
        console.log('CoopStatPublicFilterController::DisableFilter()/01');
        try {
            console.log('CoopStatPublicFilterController::DisableFilter()/02');
            await this.svCoopStatPublicFilter.disableFilter(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopRetController:DisableFilter');
        }
    }

    async UpdateSL(req, res) {
        console.log('CoopStatPublicFilterController::UpdateSL()/01');
        try {
            console.log('CoopStatPublicFilterController::UpdateSL()/02');
            await this.svCoopStatPublicFilter.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:UpdateSL');
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
            await this.svCoopStatPublicFilter.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopRetController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCoopStatPublicFilter.deleteSL(req, res);
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
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:CreateType');
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
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:EditType');
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
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:DeleteType');
        }
    }

    async GetStats(req, res) {
        try {
            await this.svCoopStatPublicFilter.getCoopStatPublicFilters(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:GetStats');
        }
    }

    async StatsByGeoLocation(req, res) {
        try {
            await this.svCoopStatPublicFilter.StatsByGeoLocation(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopStatPublicFilterController:StatsByGeoLocation');
        }
    }

}
import { BaseService } from "../../../sys/base/base.service";
import { CdController } from "../../../sys/base/cd.controller";
import { CoopMemberService } from "../services/coop-member.service";

export class CoopMemberController extends CdController {
  b: BaseService;
  svCoopMember: CoopMemberService;

  constructor() {
    super();
    this.b = new BaseService();
    this.svCoopMember = new CoopMemberService();
  }

  /**
     * curl -k -X POST -H 'Content-Type: application/json' -d '{
    "ctx": "App",
    "m": "Coops",
    "c": "CoopMember",
    "a": "Create",
    "dat": {
        "f_vals": [
        {
            "data": {
            "userId": "1010",
            "coopMemberProfile": "{}",
            "coopId": 3,
            "coopMemberName": ""
            }
        }
        ],
        "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    },
    "args": {}
    }' https://localhost:3001/api -v | jq '.'\
     * @param req
     * @param res
     */
  async Create(req, res) {
    try {
      await this.svCoopMember.create(req, res);
    } catch (e) {
      await this.b.serviceErr(req, res, e, "CoopMemberController:Create");
    }
  }

  /**
     * {
            "ctx": "Sys",
            "m": "Coops",
            "c": "CoopMember",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"companyId": 45763}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * @param req
     * @param res
     */
  async Get(req, res) {
    try {
      await this.svCoopMember.getCoopMember(req, res);
    } catch (e) {
      await this.b.serviceErr(req, res, e, "CoopMemberController:Get");
    }
  }

  /**
     * {
            "ctx": "App",
            "m": "Coops",
            "c": "CoopMember",
            "a": "GetCoopMemberProfile",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"userId": 1010}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * @param req 
     * @param res 
     */
  async GetCoopMemberProfile(req, res) {
    try {
      await this.svCoopMember.getCoopMemberProfile(req, res);
    } catch (e) {
      await this.b.serviceErr(
        req,
        res,
        e,
        "CoopMemberController:GetCoopMemberProfile"
      );
    }
  }

  async GetCoopMemberProfileByToken(req, res) {
    try {
      await this.svCoopMember.getCoopMemberProfile(req, res, true);
    } catch (e) {
      await this.b.serviceErr(
        req,
        res,
        e,
        "CoopMemberController:GetCoopMemberProfileByToken"
      );
    }
  }

  /**
     * 
     * {
        "ctx": "App",
        "m": "Coops",
        "c": "CoopMember",
        "a": "ActivateCoop",
        "dat": {
            "f_vals": [
            {
                "data": {
                "coopId": 3
                }
            }
            ],
            "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": {}
        }
     * @param req 
     * 
     * @param res 
     */
  async ActivateCoop(req, res) {
    try {
      await this.svCoopMember.activateCoop(req, res);
    } catch (e) {
      await this.b.serviceErr(req, res, e, "CoopMemberController:ActivateCoop");
    }
  }

  // async GetType(req, res) {
  //     try {
  //         await this.svCoopMember.getCoopMemberTypeCount(req, res);
  //     } catch (e) {
  //         this.b.serviceErr(req, res, e, 'CoopMemberController:Get');
  //     }
  // }

  /** Pageable request:
    curl -k -X POST -H 'Content-Type: application/json' -d '{
        "ctx": "App",
        "m": "Coops",
        "c": "CoopRef",
        "a": "GetCount",
        "dat": {
          "f_vals": [
            {
              "query": {
                "select": [
                  "coopRefId",
                  "coopRefName"
                ],
                "where": {}
              }
            }
          ],
          "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": null
      }' https://localhost:3001/api -v | jq '.'
    //  * @param req
    //  * @param res
    //  */
  async GetCount(req, res) {
    try {
      await this.svCoopMember.getCoopMemberCount(req, res);
    } catch (e) {
      await this.b.serviceErr(req, res, e, "CoopMemberController:Get");
    }
  }

  /**
    curl -k -X POST -H 'Content-Type: application/json' -d '{
        "ctx": "App",
        "m": "Coops",
        "c": "CoopRef",
        "a": "Update",
        "dat": {
          "f_vals": [
            {
              "query": {
                "update": {
                  "coopRefDescription": "updated version"
                },
                "where": {
                  "coopRefId": 114
                }
              }
            }
          ],
          "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": null
      }' https://localhost:3001/api -v | jq '.'
    //  * @param req
    //  * @param res
    //  */
  async Update(req, res) {
    console.log("CoopMemberController::Update()/01");
    try {
      console.log("CoopMemberController::Update()/02");
      await this.svCoopMember.update(req, res);
    } catch (e) {
      await this.b.serviceErr(req, res, e, "CoopMemberController:Update");
    }
  }

  /**
    //  * curl -k -X POST -H 'Content-Type: application/json' -d '{
        "ctx": "App",
        "m": "Coops",
        "c": "CoopRef",
        "a": "Delete",
        "dat": {
            "f_vals": [
            {
                "query": {
                "where": {
                    "coopRefId": 114
                }
                }
            }
            ],
            "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": null
        }' https://localhost:3001/api -v | jq '.'
    //  * @param req
    //  * @param res
    //  */
  async Delete(req, res) {
    try {
      await this.svCoopMember.delete(req, res);
    } catch (e) {
      await this.b.serviceErr(req, res, e, "CoopMemberController:Update");
    }
  }

  /**
     * {
            "ctx": "Sys",
            "m": "Coops",
            "c": "CoopMember",
            "a": "UpdateCoopMemberProfile",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": null,
                            "where": {
                                "userId": 1010
                            }
                        },
                        "jsonUpdate": [
                            {
                                "path": [
                                    "fieldPermissions",
                                    "userPermissions",
                                    [
                                        "userName"
                                    ]
                                ],
                                "value": {
                                    "userId": 1010,
                                    "field": "userName",
                                    "hidden": false,
                                    "read": true,
                                    "write": false,
                                    "execute": false
                                }
                            },
                            {
                                "path": [
                                    "fieldPermissions",
                                    "groupPermissions",
                                    [
                                        "userName"
                                    ]
                                ],
                                "value": {
                                    "groupId": 0,
                                    "field": "userName",
                                    "hidden": false,
                                    "read": true,
                                    "write": false,
                                    "execute": false
                                }
                            }
                        ]
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }
     * @param req 
     * @param res 
     */
  //  * @param req
  //  * @param res
  //  */
  async UpdateCoopMemberProfile(req, res) {
    console.log("CoopMemberController::UpdateCoopMemberProfile()/01");
    try {
      console.log("CoopMemberController::UpdateCoopMemberProfile()/02");
      await this.svCoopMember.updateCoopMemberProfile(req, res, false);
    } catch (e) {
      await this.b.serviceErr(
        req,
        res,
        e,
        "CoopMemberController::UpdateCoopMemberProfile"
      );
    }
  }

  // // getCoopMemberProfile
  // async GetCoopMemberProfile(req, res) {
  //     try {
  //         await this.svCoopMember.getCoopMemberProfile(req, res);
  //     } catch (e) {
  //         await this.b.serviceErr(req, res, e, 'CoopController:GetSL');
  //     }
  // }
}

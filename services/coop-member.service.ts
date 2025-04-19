import { getManager } from "typeorm";
import { BaseService } from "../../../sys/base/base.service";
import { CdService } from "../../../sys/base/cd.service";
import {
  CreateIParams,
  IQuery,
  IServiceInput,
  ISessionDataExt,
} from "../../../sys/base/IBase";
import { CdObjTypeModel } from "../../../sys/moduleman/models/cd-obj-type.model";
import { GroupModel } from "../../../sys/user/models/group.model";
import {
  IUserProfile,
  profileDefaultConfig,
  UserModel,
  userProfileDefault,
} from "../../../sys/user/models/user.model";
import { SessionService } from "../../../sys/user/services/session.service";
import { UserService } from "../../../sys/user/services/user.service";
import {
  coopMemberDataDefault,
  CoopMemberModel,
  coopMemberProfileDefault,
  coopMembershipDefault,
  CoopsAclScope,
  ICoopAcl,
  ICoopMemberProfile,
  ICoopMembership,
  ICoopRole,
  // IUserProfileOnly,
  MemberMeta,
} from "../models/coop-member.model";
import { CoopMemberViewModel } from "../models/coop-member-view.model";
import { CoopModel } from "../models/coop.model";
import { CoopMemberTypeModel } from "../models/coop-member-type.model";
import { Logging } from "../../../sys/base/winston.log";
import { ProfileServiceHelper } from "../../../sys/utils/profile-service-helper";
import { safeStringify } from "../../../sys/utils/safe-stringify";
import { CdLogger } from "../../../sys/utils/cd-logger";
import { distinct } from "rxjs";

export class CoopMemberService extends CdService {
  logger: Logging;
  b: BaseService;
  cdToken: string;
  uid: number;
  serviceModel: CoopMemberModel;
  srvSess: SessionService;
  validationCreateParams;
  existingUserProfile: IUserProfile;
  mergedProfile: ICoopMembership;
  coopMemberData: CoopMemberViewModel[];

  /*
   * create rules
   */
  cRules = {
    required: ["userId", "coopId"],
    noDuplicate: ["userId", "coopId"],
  };

  constructor() {
    super();
    this.logger = new Logging();
    this.b = new BaseService();
    this.serviceModel = new CoopMemberModel();
    this.srvSess = new SessionService();
  }

  ///////////////
  /**
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "CoopMember",
            "a": "Create",
            "dat": {
                "f_vals": [
                    {
                        "data": {
                            "userIdMember": "1010",
                            "memberGuid": "fe5b1a9d-df45-4fce-a181-65289c48ea00",
                            "groupGuidParent": "D7FF9E61-B143-D083-6130-A51058AD9630",
                            "cdObjTypeId": "9"
                        }
                    },
                    {
                        "data": {
                            "userIdMember": "1015",
                            "memberGuid": "fe5b1a9d-df45-4fce-a181-65289c48ea00",
                            "groupGuidParent": "2cdaba03-5121-11e7-b279-c04a002428aa",
                            "cdObjTypeId": "9"
                        }
                    }
                ],
                "token": "6E831EAF-244D-2E5A-0A9E-27C1FDF7821D"
            },
            "args": null
        }
     * @param req
     * @param res
     */

  async create(req, res) {
    const svSess = new SessionService();
    const fValsArray = req.body.dat.f_vals || []; // Get the f_vals array
    const results = [];

    for (let fVal of fValsArray) {
      req.body.dat.f_vals = [fVal]; // Set current fVal as a single object in the array

      if (await this.validateCreate(req, res)) {
        console.log("CoopMemberService::create()/this.b.err1:", this.b.err);
        await this.beforeCreate(req, res);
        const serviceInput = {
          serviceModel: CoopMemberModel,
          serviceModelInstance: this.serviceModel,
          docName: "Create coop-member",
          dSource: 1,
        };
        console.log("CoopMemberService::create()/req.post:", req.post);
        const respData = await this.b.create(req, res, serviceInput);
        console.log("CoopMemberService::create()/respData:", respData);

        // Store the result for this fVal
        results.push(respData);
      } else {
        console.log("CoopMemberService::create()/this.b.err2:", this.b.err);
        // If validation fails, push the error state
        this.b.i.app_msg = `Validation failed`;
        this.b.err.push(this.b.i.app_msg);
        await this.b.setAppState(false, this.b.i, svSess.sessResp);
      }
    }

    console.log("CoopMemberService::create()/this.b.err3:", this.b.err);
    // Combine the responses from all f_vals creations
    // this.b.i.app_msg = "Coop members processed";
    if (this.b.err.length > 0) {
      this.b.cdResp.app_state.info.messages = this.b.err;
      await this.b.setAppState(false, this.b.i, svSess.sessResp);
    } else {
      await this.b.setAppState(true, this.b.i, svSess.sessResp);
    }
    this.b.cdResp.data = results;
    await this.b.respond(req, res);
  }

  async validateCreate(req, res) {
    const svSess = new SessionService();
    let pl: CoopMemberModel = this.b.getPlData(req);
    console.log("CoopMemberService::validateCreate()/pl:", pl);

    // Validation params for the different checks
    const validationParams = [
      {
        field: "userId",
        query: { where: { userId: pl.userId } },
        model: UserModel,
      },
      {
        field: "coopId",
        query: { where: { coopId: pl.coopId } },
        model: CoopModel,
      },
    ];
    console.log(
      `CoopMemberService::validateCreate()/validationParams: ${JSON.stringify(
        validationParams
      )}`
    );
    const valid = await this.validateExistence(req, res, validationParams);
    console.log(`CoopMemberService::validateCreate/valid:${valid}`);

    console.log(
      "CoopMemberService::validateCreate/this.b.err1:",
      JSON.stringify(this.b.err)
    );

    if (!valid) {
      this.logger.logInfo(
        "coop/CoopMemberService::validateCreate()/Validation failed"
      );

      this.b.i.app_msg = `Validation failed`;
      this.b.err.push(this.b.i.app_msg);
      await this.b.setAppState(false, this.b.i, svSess.sessResp);
      return false;
    }

    // Validate against duplication and required fields
    this.validationCreateParams = {
      controllerInstance: this,
      model: CoopMemberModel,
    };

    if (await this.b.validateUnique(req, res, this.validationCreateParams)) {
      if (await this.b.validateRequired(req, res, this.cRules)) {
        return true;
      } else {
        this.b.setAlertMessage(
          `Missing required fields: ${this.b.isInvalidFields.join(", ")}`,
          svSess,
          true
        );
        return false;
      }
    } else {
      this.b.setAlertMessage(
        `Duplicate entry for ${this.cRules.noDuplicate.join(", ")}`,
        svSess,
        false
      );
      return false;
    }
  }

  // async validateExistence(req, res, validationParams) {
  //   const svSess = new SessionService();
  //   console.log(
  //     `CoopMemberService::validateExistence()/validationParams:${JSON.stringify(
  //       validationParams
  //     )}`
  //   );
  //   const promises = validationParams.map(async (param) => {
  //     console.log(
  //       `CoopMemberService::validateExistence()/param1(before test):${JSON.stringify(
  //         param
  //       )}`
  //     );
  //     if (
  //       !param.query ||
  //       !param.query.where ||
  //       Object.keys(param.query.where).length === 0
  //     ) {
  //       console.log(
  //         `CoopMemberService::validateExistence()/param2(failed): ${JSON.stringify(
  //           param
  //         )}`
  //       );
  //       this.logger.logError(
  //         `CoopMemberService::validateExistence() - Missing or empty where clause for ${param.field}`
  //       );
  //       this.b.i.app_msg = `${param.field} reference is invalid`;
  //       this.b.err.push(this.b.i.app_msg);
  //       await this.b.setAppState(false, this.b.i, svSess.sessResp);
  //       return false; // 🚀 Immediately return false on failure
  //     }
  //     console.log(
  //       `CoopMemberService::validateExistence()/param3(passed):${JSON.stringify(
  //         param
  //       )}`
  //     );

  //     const serviceInput = {
  //       serviceModel: param.model,
  //       docName: `CoopMemberService::validateExistence(${param.field})`,
  //       cmd: {
  //         action: "find",
  //         query: { where: param.query.where }, // Ensure where is not empty
  //       },
  //       dSource: 1,
  //     };

  //     console.log(
  //       "CoopMemberService::validateExistence/serviceInput:",
  //       JSON.stringify(serviceInput)
  //     );

  //     const b = new BaseService();
  //     try {
  //       const r = await b.read(req, res, serviceInput);
  //       this.logger.logInfo(
  //         `coop/CoopMemberService::validateExistence()/r:${r}`
  //       );

  //       if (r.length > 0) {
  //         this.logger.logInfo(
  //           `coop/CoopMemberService::validateExistence() - ${param.field} exists`
  //         );
  //         return true;
  //       } else {
  //         this.logger.logError(
  //           `coop/CoopMemberService::validateExistence() - Invalid ${param.field}`
  //         );
  //         this.b.i.app_msg = `${param.field} reference is invalid`;
  //         this.b.err.push(this.b.i.app_msg);
  //         await this.b.setAppState(false, this.b.i, svSess.sessResp);
  //         return false;
  //       }
  //     } catch (error) {
  //       this.logger.logError(
  //         `coop/CoopMemberService::validateExistence() - Error processing ${param.field}: ${error.message}`
  //       );
  //       this.b.i.app_msg = `coop/CoopMemberService::validateExistence() - Error processing ${param.field}: ${error.message}`;
  //       this.b.err.push(this.b.i.app_msg);
  //       await this.b.setAppState(true, this.b.i, svSess.sessResp);
  //       return false;
  //     }

  //   });

  //   const results = await Promise.all(promises);
  //   console.log("CoopMemberService::validateExistence/results:", results);
  //   console.log(
  //     "CoopMemberService::validateExistence/this.b.err2:",
  //     JSON.stringify(this.b.err)
  //   );

  //   // If any validation fails, return false
  //   return results.every((result) => result === true);
  // }
  async validateExistence(req, res, validationParams) {
    const svSess = new SessionService();
    console.log(
      `CoopMemberService::validateExistence()/validationParams: ${JSON.stringify(
        validationParams
      )}`
    );

    for (const param of validationParams) {
      // 🔥 Process each validation sequentially
      console.log(
        `CoopMemberService::validateExistence()/param1(before test): ${JSON.stringify(
          param
        )}`
      );

      console.log(
        `CoopMemberService::validateExistence()/Object.keys(param.query.where).length: ${
          Object.keys(param.query.where).length
        }`
      );

      console.log(
        `CoopMemberService::validateExistence()/where:`,
        param.query.where
      );
      console.log(
        `CoopMemberService::validateExistence()/Object.keys(where):`,
        Object.keys(param.query.where)
      );
      console.log(
        `CoopMemberService::validateExistence()/Object.getOwnPropertyNames(where):`,
        Object.getOwnPropertyNames(param.query.where)
      );
      console.log(
        `CoopMemberService::validateExistence()/JSON.stringify(where):`,
        JSON.stringify(param.query.where)
      );
      console.log(
        `CoopMemberService::validateExistence()/Type of where:`,
        typeof param.query.where
      );
      console.log(
        `CoopMemberService::validateExistence()/Instance of Object:`,
        param.query.where instanceof Object
      );

      if (
        !param.query ||
        !param.query.where ||
        // Object.keys(param.query.where).length === 0
        Object.values(param.query.where).every((value) => value === undefined)
      ) {
        console.log(
          `CoopMemberService::validateExistence()/param2(failed): ${JSON.stringify(
            param
          )}`
        );
        this.logger.logError(
          `CoopMemberService::validateExistence() - Missing or empty where clause for ${param.field}`
        );
        this.b.i.app_msg = `${param.field} reference is invalid`;
        this.b.err.push(this.b.i.app_msg);
        await this.b.setAppState(false, this.b.i, svSess.sessResp);
        return false; // 🚀 Immediately return false if validation fails
      }

      console.log(
        `CoopMemberService::validateExistence()/param3(passed): ${JSON.stringify(
          param
        )}`
      );

      const serviceInput = {
        serviceModel: param.model,
        docName: `CoopMemberService::validateExistence(${param.field})`,
        cmd: {
          action: "find",
          query: { where: param.query.where },
        },
        dSource: 1,
      };

      console.log(
        "CoopMemberService::validateExistence/serviceInput:",
        JSON.stringify(serviceInput)
      );

      const b = new BaseService();
      try {
        const r = await b.read(req, res, serviceInput);
        this.logger.logInfo(
          `coop/CoopMemberService::validateExistence()/r:${JSON.stringify(r)}`
        );

        if (r.length > 0) {
          this.logger.logInfo(
            `coop/CoopMemberService::validateExistence() - ${param.field} exists`
          );
          continue; // ✅ Continue checking next param
        } else {
          this.logger.logError(
            `coop/CoopMemberService::validateExistence() - Invalid ${param.field}`
          );
          this.b.i.app_msg = `${param.field} reference is invalid`;
          this.b.err.push(this.b.i.app_msg);
          await this.b.setAppState(false, this.b.i, svSess.sessResp);
          return false; // 🚀 Stop validation immediately on failure
        }
      } catch (error) {
        this.logger.logError(
          `coop/CoopMemberService::validateExistence() - Error processing ${param.field}: ${error.message}`
        );
        this.b.i.app_msg = `Error processing ${param.field}: ${error.message}`;
        this.b.err.push(this.b.i.app_msg);
        await this.b.setAppState(false, this.b.i, svSess.sessResp);
        return false; // 🚀 Stop validation immediately on error
      }
    }

    return true; // ✅ If all checks pass, return true
  }

  async beforeCreate(req, res): Promise<any> {
    this.b.setPlData(req, { key: "coopMemberGuid", value: this.b.getGuid() });
    this.b.setPlData(req, { key: "coopMemberEnabled", value: true });
    this.b.setPlData(req, { key: "coopMemberTypeId", value: 108 }); // set as applicant
    // stringify coopMemberProfile
    const pl: CoopMemberModel = this.b.getPlData(req);
    const strProfile = JSON.stringify(pl.coopMemberProfile);
    this.b.setPlData(req, { key: "coopMemberProfile", value: strProfile });
    return true;
  }

  async afterCreate(req, res) {
    const svSess = new SessionService();
    // flag invitation group as accepted
    await this.b.setAlertMessage("new coop-member created", svSess, true);
  }

  async createI(
    req,
    res,
    createIParams: CreateIParams
  ): Promise<CoopMemberModel | boolean> {
    // const svSess = new SessionService()
    // if (this.validateCreateI(req, res, createIParams)) {
    //     return await this.b.createI(req, res, createIParams)
    // } else {
    //     this.b.setAlertMessage(`could not join group`, svSess, false);
    // }
    return await this.b.createI(req, res, createIParams);
  }

  async validateCreateI(req, res, createIParams: CreateIParams) {
    console.log("CoopMemberService::validateCreateI()/01");
    const svSess = new SessionService();
    ///////////////////////////////////////////////////////////////////
    // 1. Validate against duplication
    console.log("CoopMemberService::validateCreateI()/011");
    this.b.i.code = "CoopMemberService::validateCreateI";
    let ret = false;
    this.validationCreateParams = {
      controllerInstance: this,
      model: CoopMemberModel,
      data: createIParams.controllerData,
    };
    // const isUnique = await this.validateUniqueMultiple(req, res, this.validationCreateParams)
    // await this.b.validateUnique(req, res, this.validationCreateParams)
    if (await this.b.validateUniqueI(req, res, this.validationCreateParams)) {
      console.log("CoopMemberService::validateCreateI()/02");
      if (await this.b.validateRequired(req, res, this.cRules)) {
        console.log("CoopMemberService::validateCreateI()/03");
        ///////////////////////////////////////////////////////////////////
        // // 2. confirm the consumerTypeGuid referenced exists
        const pl: CoopMemberModel = createIParams.controllerData;
      } else {
        console.log("CoopMemberService::validateCreateI()/12");
        ret = false;
        this.b.setAlertMessage(
          `the required fields ${this.b.isInvalidFields.join(", ")} is missing`,
          svSess,
          true
        );
      }
    } else {
      console.log("CoopMemberService::validateCreateI()/13");
      ret = false;
      this.b.setAlertMessage(
        `duplicate for ${this.cRules.noDuplicate.join(", ")} is not allowed`,
        svSess,
        false
      );
    }
    console.log("CoopMemberService::validateCreateI()/14");
    console.log("CoopMemberService::validateCreateI()/ret", ret);
    return ret;
  }

  async coopMemberExists(req, res, params): Promise<CoopMemberModel[]> {
    const serviceInput: IServiceInput = {
      serviceInstance: this,
      serviceModel: CoopMemberModel,
      docName: "CoopMemberService::coop-memberExists",
      cmd: {
        action: "find",
        query: { where: params.filter },
      },
      dSource: 1,
    };
    return this.b.read(req, res, serviceInput);
  }

  async read(req, res, serviceInput: IServiceInput): Promise<any> {
    //
  }

  async activateCoop(req, res, byToken?: boolean) {
    try {
      if (!this.validateActiveCoop(req, res)) {
        const e = "could not validate the request";
        this.b.err.push(e.toString());
        const i = {
          messages: this.b.err,
          code: "CoopMemberService:activateCoop",
          app_msg: "",
        };
        await this.b.serviceErr(req, res, e, i.code);
        await this.b.respond(req, res);
      }
      let pl: CoopMemberModel = this.b.getPlData(req);
      console.log("CoopMemberService::activateCoop()/pl:", pl);
      const coopId = pl.coopId;
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res,
        true
      );
      console.log(
        "CoopMemberService::activateCoop()/sessionDataExt:",
        sessionDataExt
      );
      // set all coops to inactive
      const serviceInputDeactivate = {
        serviceModel: CoopMemberModel,
        docName: "CoopMemberService::activateCoop",
        cmd: {
          action: "activateCoop",
          query: {
            update: { coopActive: false },
            where: { userId: sessionDataExt.currentUser.userId },
          },
        },
        dSource: 1,
      };
      const retDeactivate = await this.updateI(
        req,
        res,
        serviceInputDeactivate
      );
      console.log(
        "CoopMemberService::activateCoop()/retDeactivate:",
        retDeactivate
      );
      // set only one coop to true
      const serviceInputActivate = {
        serviceModel: CoopMemberModel,
        docName: "CoopMemberService::activateCoop",
        cmd: {
          action: "activateCoop",
          query: {
            update: { coopActive: true },
            where: {
              userId: sessionDataExt.currentUser.userId,
              coopId: coopId,
            },
          },
        },
        dSource: 1,
      };
      const retActivate = await this.updateI(req, res, serviceInputActivate);
      console.log(
        "CoopMemberService::activateCoop()/retActivate:",
        retActivate
      );
      this.b.cdResp.data = {
        coopCoopMemberProfile: await this.getCoopMemberProfileI(
          req,
          res,
          byToken
        ),
      };
      this.b.respond(req, res);
    } catch (e) {
      console.log("CoopMemberService::activateCoop()/e:", e);
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:activateCoop",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  async validateActiveCoop(req, res) {
    return true;
  }

  update(req, res) {
    // console.log('CoopMemberService::update()/01');
    let q = this.b.getQuery(req);
    q = this.beforeUpdate(q);
    const serviceInput = {
      serviceModel: CoopMemberModel,
      docName: "CoopMemberService::update",
      cmd: {
        action: "update",
        query: q,
      },
      dSource: 1,
    };
    // console.log('CoopMemberService::update()/02')
    this.b.update$(req, res, serviceInput).subscribe((ret) => {
      this.b.cdResp.data = ret;
      this.b.respond(req, res);
    });
  }

  async updateI(req, res, serviceInput: IServiceInput) {
    return await this.b.update(req, res, serviceInput);
  }

  /**
   * harmonise any data that can
   * result in type error;
   * @param q
   * @returns
   */
  beforeUpdate(q: any) {
    if (q.update.coopMemberEnabled === "") {
      q.update.coopMemberEnabled = null;
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

  /**
   * $members = mCoopMember::getCoopMember2([$filter1, $filter2], $usersOnly)
   * @param req
   * @param res
   * @param q
   */
  async getCoopMember(req, res, q: IQuery = null) {
    if (q === null) {
      q = this.b.getQuery(req);
    }
    console.log("CoopMemberService::getCoopMember/f:", q);
    const serviceInput = {
      serviceModel: CoopMemberViewModel,
      docName: "CoopMemberService::getCoopMember$",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
    try {
      this.b.read$(req, res, serviceInput).subscribe((r) => {
        console.log("CoopMemberService::read$()/r:", r);
        this.b.i.code = "CoopMemberController::Get";
        const svSess = new SessionService();
        svSess.sessResp.cd_token = req.post.dat.token;
        svSess.sessResp.ttl = svSess.getTtl();
        this.b.setAppState(true, this.b.i, svSess.sessResp);
        this.b.cdResp.data = r;
        this.b.respond(req, res);
      });
    } catch (e) {
      console.log("CoopMemberService::getCoopMember()/e:", e);
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:getCoopMember",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  async getCoopMemberProfile(req, res, byToken?: boolean) {
    try {
      if (!this.validateGetCoopMemberProfile(req, res, byToken)) {
        const e = "could not validate the request";
        this.b.err.push(e.toString());
        const i = {
          messages: this.b.err,
          code: "CoopMemberService:getCoopMemberProfile",
          app_msg: "",
        };
        await this.b.serviceErr(req, res, e, i.code);
        await this.b.respond(req, res);
      }
      await this.setCoopMemberProfileI(req, res, byToken);
      this.b.i.code = "CoopMemberController::getCoopMemberProfile";
      const svSess = new SessionService();
      svSess.sessResp.cd_token = req.post.dat.token;
      svSess.sessResp.ttl = svSess.getTtl();
      this.b.setAppState(true, this.b.i, svSess.sessResp);

      // const responseData: ICoopMembership = {
      //   memberProfile: this.mergedProfile,
      //   coopMemberData: this.coopMemberData,
      // };
      const responseData: ICoopMembership = this.mergedProfile;
      console.log(
        "CoopMemberService::getCoopMemberProfile()/responseData:",
        responseData
      );
      this.b.cdResp.data = responseData;
      this.b.respond(req, res);
    } catch (e) {
      console.log("CoopMemberService::getCoopMemberProfile()/e:", e);
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:getCoopMemberProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  async validateGetCoopMemberProfile(req, res, byToken: boolean) {
    let ret = true;
    if (
      !byToken ||
      req.post.a !== "GetMemberProfile" ||
      !("userId" in this.b.getPlData(req))
    ) {
      ret = false;
    }
    return ret;
  }

  async validateUpdateCoopMemberProfile(req, res) {
    let ret = true;
    const plQuery = this.b.getPlQuery(req);
    if (
      req.post.a !== "UpdateCoopMemberProfile" ||
      !("userId" in plQuery.where)
    ) {
      ret = false;
    }
    return ret;
  }

  async getCoopMemberProfileI(req, res, byToken: boolean) {
    try {
      await this.setCoopMemberProfileI(req, res, byToken);
      return this.mergedProfile;
    } catch (e) {
      console.log("CoopMemberService::getCoopMemberProfileI()/e:", e);
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopmemberService:getCoopMemberProfileI",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      return null;
    }
  }

  async getCoopMemberI(
    req,
    res,
    q: IQuery = null
  ): Promise<CoopMemberViewModel[]> {
    if (q === null) {
      q = this.b.getQuery(req);
    }
    console.log("CoopMemberService::getCoopMember/q:", q);
    const serviceInput = {
      serviceModel: CoopMemberViewModel,
      docName: "CoopMemberService::getCoopMemberI",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
    try {
      return await this.b.read(req, res, serviceInput);
    } catch (e) {
      console.log("CoopMemberService::read$()/e:", e);
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:update",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      return null;
    }
  }

  async getI(req, res, q: IQuery = null): Promise<CoopMemberViewModel[]> {
    if (q === null) {
      q = this.b.getQuery(req);
    }
    console.log("CoopMemberService::getCoopMember/q:", q);
    const serviceInput = {
      serviceModel: CoopMemberViewModel,
      docName: "CoopMemberService::getCoopMemberI",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
    try {
      return await this.b.read(req, res, serviceInput);
    } catch (e) {
      console.log("CoopMemberService::read$()/e:", e);
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:update",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      return null;
    }
  }

  async getCoopMemberCount(req, res) {
    const q = this.b.getQuery(req);
    console.log("CoopMemberService::getCoopMemberCount/q:", q);
    const serviceInput = {
      serviceModel: CoopMemberViewModel,
      docName: "CoopMemberService::getCoopMemberCount$",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
    this.b.readQB$(req, res, serviceInput).subscribe((r) => {
      this.b.i.code = "CoopMemberController::Get";
      const svSess = new SessionService();
      svSess.sessResp.cd_token = req.post.dat.token;
      svSess.sessResp.ttl = svSess.getTtl();
      this.b.setAppState(true, this.b.i, svSess.sessResp);
      this.b.cdResp.data = r;
      this.b.respond(req, res);
    });
  }

  delete(req, res) {
    const q = this.b.getQuery(req);
    console.log("CoopMemberService::delete()/q:", q);
    const serviceInput = {
      serviceModel: CoopMemberModel,
      docName: "CoopMemberService::delete",
      cmd: {
        action: "delete",
        query: q,
      },
      dSource: 1,
    };
    this.b.delete$(req, res, serviceInput).subscribe((ret) => {
      this.b.cdResp.data = ret;
      this.b.respond(req, res);
    });
  }

  getPals(cuid) {
    return [{}];
  }

  getCoopMembers(moduleGroupGuid) {
    return [{}];
  }

  getMembershipGroups(cuid) {
    return [{}];
  }

  async isMember(req, res, params): Promise<boolean> {
    console.log("starting CoopMemberService::isMember(req, res, data)");
    const entityManager = getManager();
    const opts = { where: params };
    const result = await entityManager.count(CoopMemberModel, opts);
    if (result > 0) {
      return true;
    } else {
      return false;
    }
  }

  getActionGroups(menuAction) {
    return [{}];
  }

  async getUserGroups(ret) {
    //
  }

  /**
   * Assemble components of the profile from existing or use default to setup the first time
   * @param req
   * @param res
   */
  async setCoopMemberProfileI(req, res, byToken: boolean) {
    console.log("CoopMemberService::setCoopMemberProfileI()/01");

    // note that 'ignoreCache' is set to true because old data may introduce confussion
    const svSess = new SessionService();
    const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
      req,
      res,
      true
    );
    console.log(
      "CoopMemberService::setCoopMemberProfileI()/sessionDataExt:",
      sessionDataExt
    );
    this.uid = sessionDataExt.currentUser.userId;

    //     - get and clone userProfile, then get coopMemberProfile data and append to cloned userProfile.

    console.log("CoopMemberService::setCoopMemberProfileI()/02");
    /**
     * Asses if request for self or for another user
     * - if request action is 'GetMemberProfile'
     * - and 'userId' is set
     */
    console.log(
      "CoopMemberService::setCoopMemberProfileI()/req.post.a",
      req.post.a
    );

    const plQuery = await this.b.getPlQuery(req);
    console.log("CoopMemberService::setCoopMemberProfileI()/plQuery:", plQuery);
    if (!byToken) {
      this.uid = plQuery.where.userId;
    }

    console.log("CoopMemberService::setCoopMemberProfileI()/uid0:", this.uid);

    /**
     * get member data
     */
    this.coopMemberData = await this.getCoopMemberI(req, res, {
      where: { userId: this.uid },
      distinct: true
    });

    if (!this.coopMemberData) {
      this.coopMemberData = [coopMemberDataDefault];
    }

    if (this.coopMemberData.length === 0) {
      this.coopMemberData = [coopMemberDataDefault];
    }

    /**
     * Remove any duplicates
     */
    this.coopMemberData = this.coopMemberCleaner(this.coopMemberData);
    console.log(
      "CoopMemberService::mergeUserProfile()/this.coopMemberData:",
      this.coopMemberData
    );

    const svUser = new UserService();
    let userProfileResult = await svUser.existingUserProfile(
      req,
      res,
      this.uid
    );
    if (!userProfileResult) {
      userProfileResult = userProfileDefault;
    }
    if (userProfileResult.length === 0) {
      userProfileResult = userProfileDefault;
    } else {
      this.existingUserProfile = userProfileResult[0];
    }
    console.log(
      "CoopMemberService::setCoopMemberProfileI()/existingUserProfile:",
      this.existingUserProfile
    );
    let modifiedUserProfile;

    if (await svUser.validateProfileData(req, res, this.existingUserProfile)) {
      console.log("CoopMemberService::setCoopMemberProfileI()/03");
      // merge coopMemberProfile data
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        this.existingUserProfile,
        byToken
      );
      console.log(
        "CoopMemberService::setCoopMemberProfileI()/this.mergedProfile1:",
        this.mergedProfile
      );
    } else {
      console.log("CoopMemberService::setCoopMemberProfileI()/04");
      if (this.validateGetCoopMemberProfile(req, res, byToken)) {
        console.log("CoopMemberService::setCoopMemberProfileI()/05");
        console.log(
          "CoopMemberService::setCoopMemberProfile()/this.uid:",
          this.uid
        );
        const uRet = await svUser.getUserByID(req, res, this.uid);
        console.log("CoopMemberService::setCoopMemberProfile()/uRet:", uRet);
        if (uRet.length > 0) {
          const { password, userProfile, ...filteredUserData } = uRet[0];
          console.log(
            "CoopMemberService::setCoopMemberProfile()/filteredUserData:",
            filteredUserData
          );
          userProfileDefault.userData = filteredUserData;
        }
      } else {
        console.log("CoopMemberService::setCoopMemberProfileI()/06");
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
      }

      console.log("CoopMemberService::setCoopMemberProfileI()/06");
      console.log(
        "CoopMemberService::setCoopMemberProfileI()/userProfileDefault1:",
        userProfileDefault
      );
      console.log("CoopMemberService::setCoopMemberProfileI()/06-1");
      // use default, assign the userId
      profileDefaultConfig[0].value.userId = this.uid;
      console.log("CoopMemberService::setCoopMemberProfileI()/07");
      console.log(
        "CoopMemberService::setCoopMemberProfileI()/userProfileDefault2:",
        userProfileDefault
      );
      console.log(
        "CoopMemberService::setCoopMemberProfileI()/profileDefaultConfig:",
        profileDefaultConfig
      );
      modifiedUserProfile = await svUser.modifyProfile(
        userProfileDefault,
        profileDefaultConfig
      );
      console.log("CoopMemberService::setCoopMemberProfileI()/08");
      console.log(
        "CoopMemberService::setCoopMemberProfileI()/modifiedUserProfile:",
        modifiedUserProfile
      );
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        modifiedUserProfile,
        byToken
      );
      console.log(
        "CoopMemberService::setCoopMemberProfile()/this.mergedProfile2:",
        JSON.stringify(this.mergedProfile)
      );
    }
  }

  coopMemberCleaner(data: CoopMemberViewModel[]): CoopMemberViewModel[] {
    const seen = new Set<string>();
  
    return data.filter((item) => {
      const key = `${item.coopMemberId}-${item.companyId}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async resetCoopMemberProfileI(req, res, byToken: boolean) {
    console.log("CoopMemberService::resetCoopMemberProfileI()/01");
    // note that 'ignoreCache' is set to true because old data may introduce confusion
    const svSess = new SessionService();
    const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
      req,
      res,
      true
    );
    console.log(
      "CoopMemberService::resetCoopMemberProfileI()/sessionDataExt:",
      sessionDataExt
    );

    //     - get and clone userProfile, then get coopMemberProfile data and append to cloned userProfile.
    //   hint:
    console.log("CoopMemberService::resetCoopMemberProfileI()/02");
    const svUser = new UserService();
    const existingUserProfile = await svUser.existingUserProfile(
      req,
      res,
      sessionDataExt.currentUser.userId
    );
    console.log(
      "CoopMemberService::resetCoopMemberProfileI()/existingUserProfile:",
      existingUserProfile
    );
    let modifiedUserProfile;

    if (await svUser.validateProfileData(req, res, existingUserProfile)) {
      console.log("CoopMemberService::resetCoopMemberProfileI()/03");
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res
      );
      const { password, userProfile, ...filteredUserData } =
        sessionDataExt.currentUser;
      userProfileDefault.userData = filteredUserData;
      console.log(
        "CoopMemberService::resetCoopMemberProfileI()/userProfileDefault:",
        userProfileDefault
      );
      // use default, assign the userId
      profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId;
      modifiedUserProfile = await svUser.modifyProfile(
        userProfileDefault,
        profileDefaultConfig
      );
      console.log(
        "CoopMemberService::resetCoopMemberProfileI()/modifiedUserProfile:",
        modifiedUserProfile
      );
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        modifiedUserProfile,
        byToken
      );
      console.log(
        "CoopMemberService::resetCoopMemberProfileI()/this.mergedProfile1:",
        this.mergedProfile
      );
    } else {
      console.log("CoopMemberService::resetCoopMemberProfileI()/04");
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res
      );
      const { password, userProfile, ...filteredUserData } =
        sessionDataExt.currentUser;
      userProfileDefault.userData = filteredUserData;
      console.log(
        "CoopMemberService::resetCoopMemberProfileI()/userProfileDefault:",
        userProfileDefault
      );
      // use default, assign the userId
      profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId;
      modifiedUserProfile = await svUser.modifyProfile(
        userProfileDefault,
        profileDefaultConfig
      );
      console.log(
        "CoopMemberService::resetCoopMemberProfileI()/modifiedUserProfile:",
        modifiedUserProfile
      );
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        modifiedUserProfile,
        byToken
      );
      console.log(
        "CoopMemberService::resetCoopMemberProfileI()/this.mergedProfile2:",
        this.mergedProfile
      );
    }
  }

  async mergeUserProfile(
    req,
    res,
    userProfile,
    byToken
  ): Promise<ICoopMembership> {
    console.log("CoopMemberService::mergeUserProfile()/01");

    CdLogger.debug("CoopMemberService::mergeUserProfile()/03");

    const plQuery = this.b.getPlQuery(req);
    if (!byToken) {
      CdLogger.debug("CoopMemberService::mergeUserProfile()/04");
      this.uid = plQuery.where.userId;
    }

    console.log("CoopMemberService::mergeUserProfile()/this.uid:", this.uid);

    const q = { 
      where: { userId: this.uid },
      distinct: true
    };
    console.log("CoopMemberService::mergeUserProfile()/q:", q);

    /**
     * get collection profile data only
     */
    let existingProfileData: CoopMemberViewModel[] =
      await this.existingCoopMemberData(req, res, this.uid);
    console.log(
      "CoopMemberService::mergeUserProfile()/existingProfileData:",
      JSON.stringify(existingProfileData)
    );

    let existingMemberMeta: MemberMeta[] = await this.extractMemberMeta(
      existingProfileData
    );

    if (!existingMemberMeta) {
      CdLogger.debug("CoopMemberService::mergeUserProfile()/05:");
      existingMemberMeta = coopMemberProfileDefault.memberMeta;
    }

    if (existingMemberMeta.length === 0) {
      CdLogger.debug("CoopMemberService::mergeUserProfile()/06:");
      existingMemberMeta = coopMemberProfileDefault.memberMeta;
    }

    console.log(
      "CoopMemberService::mergeUserProfile()/existingMemberMeta:",
      existingMemberMeta
    );

    const mergedProfile: ICoopMembership = {
      memberProfile: {
        ...userProfile,
        memberMeta: existingMemberMeta,
      },
      coopMemberData: this.coopMemberData,
    };

    console.log(
      "CoopMemberService::mergeUserProfile()/mergedProfile:",
      mergedProfile
    );

    return mergedProfile;
  }

  async updateCoopMemberProfile(req, res, byToken): Promise<void> {
    try {
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res,
        true
      );
      console.log(
        "CoopMemberService::updateCurrentUserProfile()/sessionDataExt:",
        sessionDataExt
      );
      const svUser = new UserService();
      const requestQuery: IQuery = req.post.dat.f_vals[0].query;
      const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
      let modifiedCoopMemberProfile: ICoopMembership;
      let strModifiedCoopMemberProfile;
      let strUserProfile;
      let strCoopMemberData;
      let strAcl;
      let userProfile = await svUser.getUserProfileI(
        req,
        res,
        sessionDataExt.currentUser.userId
      );

      /**
       * extract from db and merge with user profile to form coopMemberProfile
       * 1. profile data from current user coop_member entity.
       * 2. membership data
       */
      await this.setCoopMemberProfileI(req, res, byToken);

      if (await this.validateProfileData(req, res, this.mergedProfile)) {
        /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
        console.log("CoopMemberService::updateCoopMemberProfile()/01");
        console.log(
          "CoopMemberService::updateCoopMemberProfile()/jsonUpdate:",
          jsonUpdate
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          this.mergedProfile,
          jsonUpdate
        );
        console.log(
          "CoopMemberService::updateCoopMemberProfile()/strUserProfile1:",
          modifiedCoopMemberProfile
        );

        // modified profile
        strModifiedCoopMemberProfile = JSON.stringify(
          modifiedCoopMemberProfile
        );
        console.log(
          "CoopMemberService::updateCoopMemberProfile()/strModifiedCoopMemberProfile:",
          strModifiedCoopMemberProfile
        );
        // userProfile
        strUserProfile = safeStringify(userProfile);
        // acl
        // strCoopMemberData = JSON.stringify(
        //   modifiedCoopMemberProfile.memberMeta[0].coopMemberData
        // );
        // memberData
        strAcl = safeStringify(modifiedCoopMemberProfile.memberProfile.memberMeta);
      } else {
        /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
        console.log("CoopMemberService::updateCoopMemberProfile()/021");
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
        console.log(
          "CoopMemberService::updateCoopMemberProfile()/userProfileDefault:",
          userProfileDefault
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          userProfileDefault,
          jsonUpdate
        );
        console.log(
          "CoopMemberService::updateCoopMemberProfile()/modifiedCoopMemberProfile2:",
          modifiedCoopMemberProfile
        );
        // strCoopMemberData = JSON.stringify(modifiedCoopMemberProfile)
        // userProfile
        strUserProfile = JSON.stringify(userProfile);
        // acl
        // strCoopMemberData = JSON.stringify(
        //   modifiedCoopMemberProfile.memberMeta[0].coopMemberData
        // );
        // memberData
        strAcl = JSON.stringify(modifiedCoopMemberProfile.memberProfile.memberMeta);
      }

      console.log("CoopMemberService::updateCoopMemberProfile()/03");
      requestQuery.update = { coopMemberProfile: strAcl };
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/requestQuery:",
        requestQuery
      );
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/strUserProfile1-0:",
        JSON.stringify(await modifiedCoopMemberProfile)
      );

      const existingCoopMember = await this.beforeUpdateMemberProfile(req, res);
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/existingCoopMember:",
        JSON.stringify(existingCoopMember)
      );

      console.log(
        "CoopMemberService::updateCoopMemberProfile()/requestQuery:",
        JSON.stringify(requestQuery)
      );

      if (!requestQuery.update) {
        const e = "Update data is not defined";
        CdLogger.error(e);
        this.b.err.push(e);
        const i = {
          messages: this.b.err,
          code: "CoopMemberService:updateCurrentUserProfile",
          app_msg: "",
        };
        await this.b.serviceErr(req, res, e, i.code);
        await this.b.respond(req, res);
      }

      // update coopMemberProfile
      let serviceInput: IServiceInput = {
        serviceInstance: this,
        serviceModel: CoopMemberModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: requestQuery,
        },
      };
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/serviceInput.cmd:",
        serviceInput.cmd
      );
      const updateCoopMemberRet = await this.updateI(req, res, serviceInput);
      const newCoopMemberProfile = await this.existingCoopMemberData(
        req,
        res,
        sessionDataExt.currentUser.userId
      );
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/newCoopMemberProfile:",
        newCoopMemberProfile
      );
      let retCoopMember = {
        updateRet: updateCoopMemberRet,
        newProfile: newCoopMemberProfile,
      };

      const userUpdateQuery = {
        update: { userProfile: strUserProfile },
        where: {
          userId: sessionDataExt.currentUser.userId,
        },
      };
      // update user
      const userServiceInput: IServiceInput = {
        serviceInstance: svUser,
        serviceModel: UserModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: userUpdateQuery,
        },
      };
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/userServiceInput:",
        userServiceInput
      );
      const userUpdateRet = await svUser.updateI(req, res, userServiceInput);
      const fullProfile = await this.getI(req, res, {
        where: { userId: sessionDataExt.currentUser.userId },
      });
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/fullProfile:",
        JSON.stringify(await fullProfile)
      );
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/strUserProfile1-1:",
        JSON.stringify(modifiedCoopMemberProfile)
      );
      const finalRet = {
        updateRet: updateCoopMemberRet,
        userUpdateRet: userUpdateRet,
        newProfile: modifiedCoopMemberProfile,
      };

      console.log(
        "CoopMemberService::updateCoopMemberProfile()/finalRet:",
        JSON.stringify(finalRet)
      );

      // Respond with the retrieved profile data
      this.b.cdResp.data = finalRet;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:updateCurrentUserProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  /**
   * Before updating,
   * 1. Get the api request
   * 2. Extract target user
   * 3. Extract target coopId
   * 4. Check if target user is a member of target coop
   * 5. if member does not exist, create
   */
  async beforeUpdateMemberProfile(
    req,
    res
  ): Promise<boolean | CoopMemberModel> {
    /**
     * 1. Get the api request
     */
    let uid = -1;
    let plQuery = null;
    let coopId = -1;
    let coopMember: boolean | CoopMemberModel = null;
    const pl = req.post;
    const coopMemberProfile = null;
    if (req.post.a === "UpdateCoopMemberProfile") {
      plQuery = await this.b.getPlQuery(req);
      console.log(
        "CoopMemberService::beforeUpdateMemberProfile()/plQuery:",
        plQuery
      );
      // 2. Extract target user
      uid = plQuery.where.userId;
      console.log(
        "CdCliService::beforeUpdateMemberProfile()/coopMember1:",
        uid
      );
      // 3. Extract target coopId
      coopId = pl.dat.f_vals[0].jsonUpdate[0].value.coopId;
      console.log("CdCliService::beforeUpdateMemberProfile()/coopId:", coopId);
      // 4. Check if target user is a member of target coop
      const retMemberExists = await this.coopMemberExists(req, res, {
        filter: { userId: uid },
      });
      console.log(
        "CdCliService::beforeUpdateMemberProfile()/retMemberExists:",
        retMemberExists
      );
      // 5. if member does not exist, create
      if (retMemberExists.length === 0) {
        // const cdCliQuery: CdCliModel = cdCliData;
        // const svCdCli = new CdCliService();
        const newCoopMember: CoopMemberModel = {
          coopMemberGuid: this.b.getGuid(),
          userId: uid,
          coopId: coopId,
          coopMemberProfile: JSON.stringify(coopMemberProfileDefault),
          coopMemberTypeId: 103, // Initially the member should be viewed as Guest. Later to be promoted by SACCO admin
          coopMemberEnabled: true,
          coopActive: true,
        };
        console.log(
          "CdCliService::beforeUpdateMemberProfile()/newCoopMember:",
          newCoopMember
        );
        const si = {
          serviceInstance: this,
          serviceModel: CoopMemberModel,
          serviceModelInstance: this.serviceModel,
          docName: "CoopMemberService::beforeUpdateMemberProfile",
          dSource: 1,
        };
        const createIParams: CreateIParams = {
          serviceInput: si,
          controllerData: newCoopMember,
        };
        coopMember = await this.createI(req, res, createIParams);
        console.log(
          "CdCliService::beforeUpdateMemberProfile()/coopMember:",
          coopMember
        );
      } else {
        coopMember = retMemberExists[0];
      }
    }
    this.logger.logInfo(
      `CdCliService::beforeUpdateMemberProfile()/coopMember2:${await coopMember}`
    );
    return await coopMember;
  }

  async resetCoopMemberProfile(req, res, byToken): Promise<void> {
    try {
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res,
        true
      );
      console.log(
        "CoopMemberService::updateCurrentUserProfile()/sessionDataExt:",
        sessionDataExt
      );
      const svUser = new UserService();
      const requestQuery: IQuery = req.post.dat.f_vals[0].query;
      const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
      let modifiedCoopMemberProfile: ICoopMemberProfile;
      let strUserProfile;
      let strCoopMemberData;
      let strAcl;
      let userProfile = await svUser.getUserProfileI(
        req,
        res,
        sessionDataExt.currentUser.userId
      );

      /**
       * extract from db and merge with user profile to form coopMemberProfile
       * 1. profile data from current user coop_member entity.
       * 2. membership data
       */
      await this.resetCoopMemberProfileI(req, res, byToken);

      if (await this.validateProfileData(req, res, this.mergedProfile)) {
        /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
        console.log("CoopMemberService::updateCoopMemberProfile()/01");
        console.log(
          "CoopMemberService::updateCoopMemberProfile()/jsonUpdate:",
          jsonUpdate
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          this.mergedProfile,
          jsonUpdate
        );
        console.log(
          "CoopMemberService::updateCoopMemberProfile()/strUserProfile3:",
          modifiedCoopMemberProfile
        );

        // userProfile
        strUserProfile = JSON.stringify(userProfile);
        // acl
        strCoopMemberData = JSON.stringify(
          modifiedCoopMemberProfile.memberMeta[0]
        );
        // memberData
        strAcl = JSON.stringify(modifiedCoopMemberProfile.memberMeta);
      } else {
        /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
        console.log("CoopMemberService::updateCoopMemberProfile()/021");
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
        console.log(
          "CoopMemberService::updateCoopMemberProfile()/userProfileDefault:",
          userProfileDefault
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          userProfileDefault,
          jsonUpdate
        );
        console.log(
          "CoopMemberService::updateCoopMemberProfile()/modifiedCoopMemberProfile4:",
          modifiedCoopMemberProfile
        );
        // strCoopMemberData = JSON.stringify(modifiedCoopMemberProfile)
        // userProfile
        strUserProfile = JSON.stringify(userProfile);
        strAcl = JSON.stringify(modifiedCoopMemberProfile.memberMeta);
      }

      console.log(
        "CoopMemberService::updateCoopMemberProfile()/modifiedCoopMemberProfile3:",
        modifiedCoopMemberProfile
      );

      console.log("CoopMemberService::updateCoopMemberProfile()/03");
      requestQuery.update = { coopMemberProfile: strAcl };
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/requestQuery:",
        requestQuery
      );

      // update coopMemberProfile
      let serviceInput: IServiceInput = {
        serviceInstance: this,
        serviceModel: CoopMemberModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: requestQuery,
        },
      };
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/serviceInput:",
        serviceInput
      );
      const updateCoopMemberRet = await this.updateI(req, res, serviceInput);
      const newCoopMemberProfile = await this.existingCoopMemberData(
        req,
        res,
        sessionDataExt.currentUser.userId
      );
      let retCoopMember = {
        updateRet: updateCoopMemberRet,
        newProfile: newCoopMemberProfile,
      };

      const userUpdateQuery = {
        update: { userProfile: strUserProfile },
        where: {
          userId: sessionDataExt.currentUser.userId,
        },
      };
      // update user
      const userServiceInput: IServiceInput = {
        serviceInstance: svUser,
        serviceModel: UserModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: userUpdateQuery,
        },
      };
      console.log(
        "CoopMemberService::updateCoopMemberProfile()/userServiceInput:",
        userServiceInput
      );
      const userUpdateRet = await svUser.updateI(req, res, userServiceInput);
      const fullProfile = await this.getI(req, res, {
        where: { userId: sessionDataExt.currentUser.userId },
      });
      const finalRet = {
        updateRet: updateCoopMemberRet,
        userUpdateRet: userUpdateRet,
        newProfile: modifiedCoopMemberProfile,
      };

      // Respond with the retrieved profile data
      this.b.cdResp.data = finalRet;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:updateCurrentUserProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  /////////////////////////////////////////////
  // NEW USER PROFILE METHODS...USING COMMON CLASS ProfileServiceHelper
  //

  async existingCoopMemberData(req, res, cuid): Promise<CoopMemberViewModel[]> {
    const si: IServiceInput = {
      serviceInstance: this,
      serviceModel: CoopMemberViewModel,
      docName: "CoopMemberService::existingUserProfile",
      dSource: 1,
      cmd: {
        action: "find",
        query: { select: ["coopMemberProfile"], where: { userId: cuid } },
      },
      // mapping: { profileField: "coopMemberProfile" },
    };
    const existinCoopMemberData: CoopMemberViewModel[] = await this.b.read(
      req,
      res,
      si
    );
    console.log(
      "CoopMemberService::existingCoopMemberData()/existinCoopMemberData:",
      existinCoopMemberData
    );
    console.log(
      "CoopMemberService::existingCoopMemberData()/existinCoopMemberData.length:",
      existinCoopMemberData.length
    );
    return existinCoopMemberData;
    // return formatedExistingData = await this.extractMemberMeta(existinCoopMemberData);
  }

  async extractMemberMeta(
    existingProfileData: CoopMemberViewModel[]
  ): Promise<MemberMeta[]> {
    const uniqueMap = new Map<string, MemberMeta>();

    for (const viewModel of existingProfileData) {
      const profileList = viewModel.coopMemberProfile ?? [];

      for (const meta of profileList) {
        // Generate a unique key for comparison
        const key = `${meta.coopId}-${meta.coopRole?.id ?? "null"}`;

        // Only add if not already present
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, meta);
        }
      }
    }

    // Return array of unique MemberMeta
    return Array.from(uniqueMap.values());
  }

  // Helper method to validate profile data
  async validateProfileData(
    req,
    res,
    profileData: ICoopMembership
  ): Promise<boolean> {
    console.log(
      "CoopMemberService::validateProfileData()/profileData:",
      profileData
    );
    // const profileData: IUserProfile = updateData.update.userProfile
    // console.log("CoopMemberService::validateProfileData()/profileData:", profileData)
    // Check if profileData is null or undefined
    if (!profileData) {
      console.log("CoopMemberService::validateProfileData()/01");
      return false;
    }

    // Validate that the required fields of IUserProfile exist
    if (
      !profileData.memberProfile.fieldPermissions ||
      !profileData.memberProfile.userData
    ) {
      console.log("CoopMemberService::validateProfileData()/02");
      console.log(
        "CoopMemberService::validateProfileData()/profileData.userData:",
        profileData.memberProfile.userData
      );
      console.log(
        "CoopMemberService::validateProfileData()/profileData.fieldPermissions:",
        profileData.memberProfile.fieldPermissions
      );
      return false;
    }

    // Example validation for bio length
    if (
      profileData.memberProfile.bio &&
      profileData.memberProfile.bio.length > 500
    ) {
      console.log("CoopMemberService::validateProfileData()/03");
      const e = "Bio data is too long";
      this.b.err.push(e);
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:validateProfileData",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      return false; // Bio is too long
    }
    return true;
  }

  // CRUD Methods for coopRole within memberMeta
  // // Usage examples
  // const memberProfile = coopMemberProfileDefault;

  // // Add a new role
  // addCoopRole(memberProfile, -1, { scope: CoopsAclScope.COOPS_SACCO_ADMIN, geoLocationId: 101 });

  // // Get all roles for a specific memberMeta by coopId
  // console.log(getCoopRoles(memberProfile, -1));

  // // Update an existing role
  // const updated = updateCoopRole(memberProfile, -1, CoopsAclScope.COOPS_SACCO_ADMIN, { scope: CoopsAclScope.COOPS_SACCO_ADMIN, geoLocationId: 202 });
  // console.log('Update successful:', updated);

  // // Delete a role
  // const deleted = deleteCoopRole(memberProfile, -1, CoopsAclScope.COOPS_GUEST);
  // console.log('Delete successful:', deleted);

  /**
   * Add a new role to coopRole within a specific memberMeta identified by coopId
   * @param profile The member profile to modify
   * @param coopId The ID of the specific memberMeta
   * @param newRole The new role to add to coopRole
   */
  addCoopRole(
    profile: ICoopMemberProfile,
    coopId: number,
    newRole: ICoopAcl
  ): boolean {
    const memberMeta = profile.memberMeta?.find((m) => m.coopId === coopId);
    if (memberMeta) {
      memberMeta.coopRole.push(newRole);
      return true;
    }
    return false; // Return false if memberMeta with the given coopId was not found
  }

  /**
   * Get all coop roles from a specific memberMeta identified by coopId
   * @param profile The member profile to retrieve roles from
   * @param coopId The ID of the specific memberMeta
   * @returns An array of ICoopAcl representing all coop roles, or null if not found
   */
  getCoopRoles(profile: ICoopMemberProfile, coopId: number): ICoopRole | null {
    const memberMeta = profile.memberMeta?.find((m) => m.coopId === coopId);
    return memberMeta ? memberMeta.coopRole : null;
  }

  /**
   * Update an existing role in coopRole within a specific memberMeta identified by coopId
   * @param profile The member profile to modify
   * @param coopId The ID of the specific memberMeta
   * @param scope The scope of the role to update
   * @param updatedRole The updated role data
   * @returns boolean indicating success or failure
   */
  updateCoopRole(
    profile: ICoopMemberProfile,
    coopId: number,
    scope: CoopsAclScope,
    updatedRole: ICoopAcl
  ): boolean {
    const memberMeta = profile.memberMeta?.find((m) => m.coopId === coopId);
    if (memberMeta) {
      const roleIndex = memberMeta.coopRole.findIndex(
        (role) => role.scope === scope
      );
      if (roleIndex !== -1) {
        memberMeta.coopRole[roleIndex] = updatedRole;
        return true;
      }
    }
    return false; // Return false if role with the given scope was not found in coopRole
  }

  /**
   * Remove a role from coopRole within a specific memberMeta identified by coopId
   * @param profile The member profile to modify
   * @param coopId The ID of the specific memberMeta
   * @param scope The scope of the role to remove
   * @returns boolean indicating success or failure
   */
  deleteCoopRole(
    profile: ICoopMemberProfile,
    coopId: number,
    scope: CoopsAclScope
  ): boolean {
    const memberMeta = profile.memberMeta?.find((m) => m.coopId === coopId);
    if (memberMeta) {
      const roleIndex = memberMeta.coopRole.findIndex(
        (role) => role.scope === scope
      );
      if (roleIndex !== -1) {
        memberMeta.coopRole.splice(roleIndex, 1);
        return true;
      }
    }
    return false; // Return false if role with the given scope was not found in coopRole
  }
}

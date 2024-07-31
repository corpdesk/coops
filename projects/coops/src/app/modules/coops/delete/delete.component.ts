import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AclService, ICdPushEnvelop, IQuery, NotificationService, 
  BaseModel, BaseService, DEFAULT_PUSH_RECEPIENTS, SessService } from '@corpdesk/core';
import { PageService } from '@corpdesk/naz';
import { USER_STEP_MODEL } from '../coops.model';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {
  baseModel: BaseModel;
  formConfig: any = {};
  updateQuery: IQuery;

  constructor(
    private aRoute: ActivatedRoute,
    public router: Router, // do not remove, used by libraries to navigate
    private svBase: BaseService,
    private svPage: PageService,
    private svAcl: AclService,
    private svNotif: NotificationService,
    private svSess: SessService,
  ) {
    this.init();
  }

  ngOnInit() {
    this.aRoute.queryParams
      .subscribe(params => {
        this.svAcl.initComponent(params, this, this.svSess).then((ret) => {
        });
      });
  }

  init() {
    this.baseModel = new BaseModel(USER_STEP_MODEL.module, USER_STEP_MODEL.controller);
    this.baseModel.breadCrumbItems = this.svPage.setBreadCrumbs(USER_STEP_MODEL.controller, 'Delete')
    this.baseModel.data.subTitle = 'confirm before delete';
  }

  async deleteItem(deleteQuery: any) {
    this.svBase.delete$(deleteQuery, this.baseModel.token)
      .subscribe((res: any) => {
        const pushEnvelop: ICdPushEnvelop = {
          pushData: {
            appId: '',
            appSockets: [],
            pushGuid: '',
            m: null,
            pushRecepients: DEFAULT_PUSH_RECEPIENTS,
            emittEvent: 'push-notif',
            triggerEvent: 'send-notif',
            token: '',
            commTrack: {
              initTime: null,
              relayTime: null,
              pushed: false,
              pushTime: null,
              relayed: false,
              deliveryTime: null,
              delivered: false,
              completed: false,
              completedTime: null,
              cached: false,
              cachedTime: null,
              saved: false,
              savedTime: null
            },
            isNotification: null,
            isAppInit: null
          },
          req: null,
          resp: null
        };
        this.svNotif.emitNotif(pushEnvelop);
      })
  }
}

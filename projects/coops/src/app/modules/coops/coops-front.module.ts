import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule, NgbDropdownModule, NgbTooltipModule, 
  NgbAccordionModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ArchwizardModule } from 'angular-archwizard';
import { NgToggleModule } from 'ng-toggle-button';
import { environment } from '../../../environments/environment';
import { CdPushModule, BaseModule, UserModule } from '@corpdesk/core';
import { NazUiModule, NazTableModule, NazCreateModule, 
  NazEditModule, NazDeleteModule } from '@corpdesk/naz';
import { CoopsRoutingModule } from './coops-front-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CreateComponent } from './create/create.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeleteComponent } from './delete/delete.component';
import { EditComponent } from './edit/edit.component';
import { ListComponent } from './list/list.component';
import { DatamanComponent } from './dataman/dataman.component';
import { AdminComponent } from './admin/admin.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { ForumComponent } from './forum/forum.component';
import { TrainingComponent } from './training/training.component';
import { IssuesComponent } from './issues/issues.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    CreateComponent,
    DashboardComponent,
    DeleteComponent,
    EditComponent,
    ListComponent,
    DatamanComponent,
    AdminComponent,
    DocumentationComponent,
    IssuesComponent,
    ForumComponent,
    TrainingComponent,
  ],
  imports: [
    CommonModule,
    CoopsRoutingModule,
    FormsModule, ReactiveFormsModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.TRACE,
      serverLogLevel: NgxLoggerLevel.OFF,
      serverLoggingUrl: '/api/logs',
      disableConsoleLogging: false, // Disable logging to the browser console
      enableSourceMaps: true, // Enable source maps to map errors back to original TypeScript code
      colorScheme: ['purple', 'teal', 'gray', 'gray', 'red', 'red', 'red'] // Customize log colors
    }),
    NgbNavModule, NgbDropdownModule, NgbTooltipModule, NgbAccordionModule,
    NazUiModule, NazTableModule, NazCreateModule, NazEditModule, NazDeleteModule, NgbAlertModule,
    Ng2SearchPipeModule,
    ArchwizardModule,
    NgToggleModule,
    NgSelectModule,
    BaseModule.forChild(environment),
    UserModule.forChild(environment),
    CdPushModule.forChild(environment),
  ],
  exports: [
    LoginComponent,
    RegisterComponent,
    CreateComponent,
    DashboardComponent,
    DeleteComponent,
    EditComponent,
    ListComponent,
    DatamanComponent,
    AdminComponent,
    DocumentationComponent,
    IssuesComponent,
    ForumComponent,
    TrainingComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CoopsFrontModule { }

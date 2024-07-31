import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { DeleteComponent } from './delete/delete.component';
import { CreateComponent } from './create/create.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { DatamanComponent } from './dataman/dataman.component';
import { AdminComponent } from './admin/admin.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { IssuesComponent } from './issues/issues.component';
import { ForumComponent } from './forum/forum.component';
import { TrainingComponent } from './training/training.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'list', component: ListComponent },
  { path: 'edit', component: EditComponent },
  { path: 'delete', component: DeleteComponent },
  { path: 'create', component: CreateComponent },
  { path: 'passwordreset', component: PasswordresetComponent },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'dataman', component: DatamanComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'documentation', component: DocumentationComponent },
  { path: 'issues', component: IssuesComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'training', component: TrainingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoopsRoutingModule {
  constructor(private router: Router) {
    router.events.subscribe((routeState) => {
      console.log('Coops::CoopsRoutingModule::constructor()/routeState:', routeState)
    });
  }
}

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

const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'list', component: ListComponent },
  { path: 'edit', component: EditComponent },
  { path: 'delete', component: DeleteComponent },
  { path: 'create', component: CreateComponent },
  { path: 'passwordreset', component: PasswordresetComponent },
  { path: 'dashboard', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoopsRoutingModule {
  constructor(private router: Router){
    router.events.subscribe((routeState) => {
        console.log('Coops::CoopsRoutingModule::constructor()/routeState:', routeState) 
    });
  }
 }

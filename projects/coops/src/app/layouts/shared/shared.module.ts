import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ClickOutsideModule } from 'ng-click-outside';
import { LanguageService } from '../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

import { TopbarComponent } from './topbar/topbar.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RightsidebarComponent } from './rightsidebar/rightsidebar.component';
import { HorizontaltopbarComponent } from './horizontaltopbar/horizontaltopbar.component';
import { HorizontalnavbarComponent } from './horizontalnavbar/horizontalnavbar.component';
import { NgScrollbar } from 'ngx-scrollbar';

@NgModule({
  // tslint:disable-next-line: max-line-length
  declarations: [TopbarComponent, FooterComponent, SidebarComponent, RightsidebarComponent, HorizontaltopbarComponent, HorizontalnavbarComponent],
  imports: [
    CommonModule,
    TranslateModule,
    // PerfectScrollbarModule,
    NgScrollbar,
    NgbDropdownModule,
    ClickOutsideModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [TopbarComponent, FooterComponent, SidebarComponent, RightsidebarComponent, HorizontaltopbarComponent, HorizontalnavbarComponent],
  providers: [LanguageService],
  schemas:[NO_ERRORS_SCHEMA]
})
export class SharedModule { }

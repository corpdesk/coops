import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagetitleComponent } from './pagetitle/pagetitle.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [PagetitleComponent],
  imports: [
    CommonModule,
    NgbModule
  ],
  exports: [PagetitleComponent]
})
export class UiModule { }

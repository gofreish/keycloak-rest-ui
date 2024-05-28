import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    AccordionModule,
    RouterModule,
    CardModule
  ],
  templateUrl: './index.component.html'
})
export class IndexComponent {

}

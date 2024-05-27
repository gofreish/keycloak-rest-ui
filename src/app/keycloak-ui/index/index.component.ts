import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    AccordionModule,
    RouterModule
  ],
  templateUrl: './index.component.html',
})
export class IndexComponent {

}

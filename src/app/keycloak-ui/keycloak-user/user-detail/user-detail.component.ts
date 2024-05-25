import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { UserService } from '../../service/user.service';
import { ActivatedRoute } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DefaultKeycloakUser, KeycloakUser } from '../../model/user.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    AccordionModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnInit{

    user: WritableSignal<KeycloakUser> = signal(DefaultKeycloakUser);
    constructor(
        private userService: UserService,
        private activatedRoute: ActivatedRoute,
        private location: Location
    ){}

    ngOnInit(): void {
        const userId = this.activatedRoute.snapshot.paramMap.get("id");
        if(!userId){
            this.location.back();
            return;
        }
        this.userService.getUserById(userId)
            .then(
                resp => {
                    this.user.set(resp);
                    console.log(resp);
                }
            )
            .catch(
                err => console.log(err)
            );
        this.userService.getUserGroupsById(userId)
        .then(
            resp => {
                console.log(resp);
            }
        )
        .catch(
            err => console.log(err)
        );
    }
}

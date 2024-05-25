import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { UserService } from '../service/user.service';
import { KeycloakUser } from '../model/user.model';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-keycloak-user',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    ToolbarModule,
    CardModule
  ],
  templateUrl: './keycloak-user.component.html',
})
export class KeycloakUserComponent implements OnInit{

    users: WritableSignal<KeycloakUser[]> = signal([]);
    constructor(
        private userService: UserService,
        private router: Router
    ){}

    ngOnInit(): void {
        this.userService.getAllUsers().then(
            resp => {
                this.users.set(resp);
                console.log(resp);
            }
        ).catch(
            err => console.log(err)
        );
    }

    seeDetail(id: string){
        console.log(id);
        this.router.navigateByUrl(`keycloak/users/detail/${id}`);
    }
}

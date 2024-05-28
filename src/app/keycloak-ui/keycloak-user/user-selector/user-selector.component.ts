import { Component, OnInit, WritableSignal, output, signal } from '@angular/core';
import { UserService } from '../../service/user.service';
import { KeycloakUser } from '../../model/user.model';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { KeycloakLoadingComponent } from '../../shared/keycloak-loading.component';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [
    KeycloakLoadingComponent,
    TableModule,
    CommonModule,
    CardModule,
    ButtonModule,
    FormsModule,
    InputTextModule
  ],
  templateUrl: './user-selector.component.html',
})
export class UserSelectorComponent implements OnInit{
    selectedUsersList: KeycloakUser[] = [];
    isLoading: WritableSignal<boolean> = signal(false);
    users: WritableSignal<KeycloakUser[]> = signal([]);

    selectedUsers = output<KeycloakUser[]>();

    abortSelection = output<any>();

    constructor(
        private userService: UserService
    ){}

    ngOnInit(): void {
        this.isLoading.update(value => !value);
        this.userService.getAllUsers()
        .then(
            users => this.users.set(users)
        ).catch(
            err => console.log(err)
        )
        .finally(
            () => this.isLoading.update(value => !value)
        )
    }

    usersSelected(){
        this.selectedUsers.emit(this.selectedUsersList);
        this.selectedUsersList = [];
    }

    annulerSelection(){
        this.abortSelection.emit("");
        this.selectedUsersList = [];
    }
}

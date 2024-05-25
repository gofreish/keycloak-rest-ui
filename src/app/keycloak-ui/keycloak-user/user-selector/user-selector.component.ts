import { Component, EventEmitter, OnInit, Output, WritableSignal, output, signal } from '@angular/core';
import { UserService } from '../../service/user.service';
import { KeycloakUser } from '../../model/user.model';
import { LoadingComponent } from '../../../shared/loading.component';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [
    LoadingComponent,
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

    @Output()
    selectedUsers: EventEmitter<KeycloakUser[]> = new EventEmitter();

    @Output()
    abortSelection: EventEmitter<any> = new EventEmitter();

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

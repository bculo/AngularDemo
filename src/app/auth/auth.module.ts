import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

const authRoutes: Routes = [
    { path: 'auth', component: AuthComponent }
]

@NgModule({
    declarations: [
        AuthComponent
    ],
    imports: [
        RouterModule.forChild(authRoutes), 
        FormsModule, 
        SharedModule, 
        CoreModule
    ],
})
export class AuthModule { }
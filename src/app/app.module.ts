import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import {MatButtonModule} from "@angular/material/button";
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import {FileUploadModule} from 'primeng/fileupload';
import {HttpClientModule} from '@angular/common/http';
import {UsuarioCrudService} from "./components/services/users-crud/usuario-crud.service";
import {TabViewModule} from 'primeng/tabview';
import {ToastModule} from 'primeng/toast';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {DialogModule} from "primeng/dialog";
import {SliderModule} from "primeng/slider";
import {CardModule} from "primeng/card";
import {TableModule} from "primeng/table";
import {InputMaskModule} from "primeng/inputmask";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {interceptorProvider} from "./interceptors/prod-interceptor.service";
import {MessageModule} from "primeng/message";
import {ImageModule} from "primeng/image";
import {BadgeModule} from "primeng/badge";
import {AccordionModule} from "primeng/accordion";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    DashboardComponent,
    SignUpComponent,
    PagenotfoundComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    FileUploadModule,
    HttpClientModule,
    TabViewModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    SliderModule,
    CardModule,
    TableModule,
    InputMaskModule,
    ConfirmDialogModule,
    MessageModule,
    ImageModule,
    BadgeModule,
    AccordionModule
  ],
  providers: [
    UsuarioCrudService,
    MessageService,
    PrimeNGConfig,
    ConfirmationService,
    ConfirmationService,
    interceptorProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

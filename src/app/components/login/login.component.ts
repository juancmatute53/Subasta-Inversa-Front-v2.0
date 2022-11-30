import { Component, OnInit } from '@angular/core';
import {UsuarioCrudService} from "../services/users-crud/usuario-crud.service";
import {FormBuilder, Validators} from "@angular/forms";
import {TokenService} from "../services/token/token.service";
import {AuthService} from "../services/auth/auth.service";
import {Router} from "@angular/router";
import {LoginUsuario} from "../../models/login-usuario";
import {MessageService} from "primeng/api";
import {of} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formLoginUsuario: any;
  isLogin = false;
  isLoginFail = false;
  loginUsuario: any; // LoginUsaurio
  roles: string[] = [];

  constructor(private _tokenService: TokenService,
              private _authServices: AuthService,
              private _router: Router,
              private _formBuilder: FormBuilder,
              private _messageService: MessageService) { }

  ngOnInit(): void {
    if (this._tokenService.getToken()){
      this.isLogin = true;
      this.isLoginFail = false;
      this.roles = this._tokenService.getAuthorities();
    }
    this.crearFormularioLogin();
  }

  crearFormularioLogin(): void{
    this.formLoginUsuario = this._formBuilder.group({
      nombreUsuario: ['', [Validators.required]],
      contrasenia: ['', [Validators.required]]
    })
  }

  public onLogin(): void {
    this. loginUsuario = new LoginUsuario(
      this.formLoginUsuario.get("nombreUsuario").value,
      this.formLoginUsuario.get("contrasenia").value);

    this._authServices.login(this.loginUsuario). then(res =>{
      this.isLogin = true;
      this.isLoginFail = false;
      this._tokenService.setToken(res.token);
      this._tokenService.setUserName(res.nombreUsuario);
      this._tokenService.setAuthorities(res.authorities);
      this.roles = res.authorities;
      this.addSingle("Logueo exitoso", "success", "Logueo")
      this._router.navigate(['/dashboard']);
    }).catch(err =>{
      this.isLogin = false;
      this.isLoginFail = true;
      if (err.status === 401){
        this.addSingle("El usuario no esta registrado", "error", "Error de Sesion")
      }else {
        if (err.error.mensaje === undefined){
          this.addSingle("Fallo al inicio de sesion", "error", "Error de Sesion")
        }else {
          this.addSingle("Fallo al inicio de sesion " + err.error.mensaje, "error", "Error de Sesion")
        }
      }
    })
  }

  addSingle(message: string, severity: string, summary: string) {
    this._messageService.add({severity: severity, summary: summary, detail: message});
  }

  validarUsuario(): void{
    console.log('NOMBRE ',this.formLoginUsuario.get("nombreUsuario").value);
  }

}

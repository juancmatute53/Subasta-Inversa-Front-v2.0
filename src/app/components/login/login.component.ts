import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth/auth.service';
import { TokenService } from '../services/token/token.service';
import { LoginUsuario } from '../../models/login-usuario';




@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginFrom: FormGroup; // Esta variable representa un formulario de login en Angular
  isLogin: boolean = false; // Esta variable se utiliza para determinar si el usuario está conectado o no
  isLoginFail: boolean = false; // Esta variable se utiliza para indicar si el inicio de sesión ha fallado
  loginUsuario: LoginUsuario | undefined; // LoginUsaurio // Esta variable representa las credenciales del usuario para el inicio de sesión
  roles: string[] = []; // Esta variable almacena los roles del usuario después de que ha iniciado sesión.

  constructor(
    private _tokenService: TokenService, // Inyección de dependencia de TokenService
    private _authServices: AuthService, // Inyección de dependencia de AuthService
    private _router: Router, // Inyección de dependencia de Router
    private _formBuilder: FormBuilder, // Inyección de dependencia de FormBuilder
    private _messageService: MessageService // Inyección de dependencia de MessageService
  ) {
    // Se crea un FormGroup usando el FormBuilder para crear un formulario con dos campos requeridos: nombreUsuario y contrasenia
    this.loginFrom = this._formBuilder.group({
      nombreUsuario: ['', [Validators.required]],
      contrasenia: ['', [Validators.required]]
    })
  }


  // Este método se ejecuta después de que la vista y los componentes auxiliares se hayan inicializado
  ngOnInit(): void {
    // Verifica si ya hay un token en el servicio de token para determinar si el usuario ya está logueado
    if (this._tokenService.getToken()){
      this.isLogin = true; // Marca como autenticado
      this.isLoginFail = false; // Marca como no fallido el login
      this.roles = this._tokenService.getAuthorities(); // Obtiene los roles del usuario logueado
    }
  }

  // Método público para el inicio de sesión
  public onLogin(): void {
    // Verificar si el formulario de inicio de sesión es válido
    if(!this.loginFrom.valid){
      return;
    }
    // Obtener los valores de nombre de usuario y contraseña del formulario
    const nombreUsuario = this.loginFrom.get("nombreUsuario");
    const contrasenia = this.loginFrom.get("contrasenia");

    // Crear un objeto LoginUsuario si se obtuvieron valores de nombre de usuario y contraseña
    if(nombreUsuario && contrasenia){
      this.loginUsuario = new LoginUsuario(
        nombreUsuario.value,
        contrasenia.value
      );
    }

    // Verificar si se pudo crear el objeto LoginUsuario
    if (!this.loginUsuario) {
      return;
    }

    // Llamar al servicio de autenticación para iniciar sesión con el objeto LoginUsuario creado
    this._authServices.login(this.loginUsuario). then(loginResponse =>{
      // Marcar como exitoso el inicio de sesión
      this.isLogin = true;
      this.isLoginFail = false;
      // Guardar el token de inicio de sesión en el servicio de tokens
      this._tokenService.setToken(loginResponse.token);
      // Guardar el nombre de usuario en el servicio de tokens
      this._tokenService.setUserName(loginResponse.nombreUsuario);
      // Guardar los permisos del usuario en el servicio de tokens
      this._tokenService.setAuthorities(loginResponse.authorities);
      // Asignar los roles del usuario a una variable local
      this.roles = loginResponse.authorities;
      // Agregar una notificación de éxito al inicio de sesión
      this.addSingle("Logueo exitoso", "success", "Logueo")
      // Redirigir al usuario a la página de inicio del dashboard
      this._router.navigate(['/dashboard']);
    }).catch(loginError =>{
      // Marcar como fallido el inicio de sesión
      this.isLogin = false;
      this.isLoginFail = true;
      // Mostrar una notificación de error si el usuario no está registrado
      if (loginError.status === 401){
        this.addSingle("El usuario no esta registrado", "error", "Error de Sesion")
      }else {
        // Mostrar una notificación de error si se produjo un error durante el inicio de sesión
        if (loginError.error.mensaje === undefined){
          this.addSingle("Fallo al inicio de sesion", "error", "Error de Sesion")
        }else {
          this.addSingle("Fallo al inicio de sesion " + loginError.error.mensaje, "error", "Error de Sesion")
        }
      }
    })
  }
// Método para agregar una notificación en el servicio de mensajes
  addSingle(message: string, severity: string, summary: string) {
    // Agregar una notificación con los parámetros especificados
    this._messageService.add({severity: severity, summary: summary, detail: message});
  }
}

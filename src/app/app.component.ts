import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Compilador';
  cadena = ``;
  errores = [];
  numeros = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  variables = new RegExp('[a-zA-Z0-9]*');
  simbolos = ['+', '-', '*', '/', '(', ')', '='];
  operadores = ['+', '-', '*', '/', '='];
  palabrasReservadas = new RegExp('for|while|if|switch');
  letras = new RegExp('[A-Za-z]');
  pila = [];
  salida = [];
  analizar = () => {
    this.salida = [];
    this.errores = [];
    this.cadena = this.cadena.replace(/ /g, "");
    for (var i = 0; i < this.cadena.length; i++) {
      let response = this.validarLexema(i);
      if (response.estado != true) {
        this.errores.push(response.detalle);
        return;
      } else if (response.detalle != undefined) {
        this.salida.push(response.detalle);
      }
      if (response.fin != undefined) {
        i = response.fin - 1;
      }
    }
    if (this.cadena.length == 1) {
      if (this.cadena[0] == '(') {
        this.errores.push("No cerraste tu (");
      }
    }
    if (this.pila.length > 0) {
      this.errores.push("No cerraste tu (");
    }
  }

  numeroCompleto = (indice) => {
    // @ts-ignore
    // tslint:disable-next-line:triple-equals
    if (this.numeros.some(value => value == this.cadena[indice])) {
      const response = this.numeroCompleto(indice + 1);
      if (!response.estado) {
        if (response.detalle < indice) {
          return {estado: true, detalle: indice};
        }
      }
      return {estado: true, detalle: response.detalle};
    } else {
      return {estado: false, detalle: indice};
    }
  }
  palabraCompleta = (indice) => {
    if (this.variables.test(this.cadena[indice]) && indice < this.cadena.length && this.cadena[indice] !== '=') {
      const response = this.palabraCompleta(indice + 1);
      if (!response.estado) {
        if (response.detalle < indice) {
          return {estado: true, detalle: indice};
        }
      }
      return {estado: true, detalle: response.detalle};
    } else {
      return {estado: false, detalle: indice};
    }
  }

  validarLexema = (indice) => {
    if (this.cadena[indice] == '(') {
      this.pila.push('(');
      return {estado: true, detalle: '( inicio de parentesis'};
    } else {
      if (this.letras.test(this.cadena[indice])) {
        let response = this.palabraCompleta(indice + 1);
        let palabra = '';
        for (let e = indice; e < response.detalle; e++) {
          palabra += this.cadena[e];
        }
        console.log(palabra);
        if (this.palabrasReservadas.test(palabra)) {
          return {estado: true, detalle: palabra + " palabra reservada", fin: response.detalle};
        } else if (this.cadena[response.detalle + 1] == '=') {
          return {estado: true, detalle: palabra + " variable", fin: response.detalle};
        } else {
          return {estado: true, detalle: palabra + " variable", fin: response.detalle};
        }
        return {estado: false, detalle: palabra + " dato invalido", fin: response.detalle};
      }
      // @ts-ignore
      else if (this.numeros.some(value => value == this.cadena[indice])) {
        if (this.cadena[indice + 1] == '(') {
          return {
            estado: false,
            detalle: "Se esperaba un operador u otro numero y se recibio " + this.cadena[indice + 1]
          };
        }
        let response = this.numeroCompleto(indice + 1);
        let numeroC = '';
        for (let e = indice; e < response.detalle; e++) {
          numeroC += this.cadena[e];
        }
        return {estado: true, detalle: numeroC + " es un numero entero", fin: response.detalle};
      } else if (this.cadena[indice] == ')') {
        if (this.pila.length > 0) {
          this.pila.pop();
          return {estado: true, detalle: ') fin de parentesis'};
        } else {
          return {estado: false, detalle: "No se contaba con otro ( en la pila"};
        }
      } else if (this.operadores.some(value => value == this.cadena[indice])) {
        if (this.cadena[indice + 1] == '(') {
          return {estado: true};
        } else { // @ts-ignore
          if (this.numeros.some(value => value == this.cadena[indice + 1])) {
            return {estado: true, detalle: this.cadena[indice] + ' es operador'};
          } else {
            return {estado: false, detalle: "Se esperaba un numero y se recibio: " + this.cadena[indice + 1]};
          }
        }
      } else if (this.cadena[indice + 1] == '(') {
        this.pila.push('(');
        return {estado: true};
      } else {
        return {estado: true};
      }
    }
  }
}


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
  signos = new RegExp('<|>|=');
  simbolos = ['+', '-', '*', '/', '(', ')', '='];
  operadores = ['+', '-', '*', '/', '='];
  palabrasReservadas = new RegExp('for|while|if|switch');
  letras = new RegExp('[A-Za-z]');
  pila = [];
  salida = [];
  analizar = () => {
    this.salida = [];
    this.errores = [];
    this.cadena = this.cadena.replace(/\s+/g, '');
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
    if (this.numeros.some(value => value == this.cadena[indice]) && this.cadena[indice] != '{') {
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
    if (this.variables.test(this.cadena[indice]) && indice < this.cadena.length && !this.signos.test(this.cadena[indice]) && this.cadena[indice] != '(') {
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
        let expresion;
        for (let e = indice; e < response.detalle; e++) {
          palabra += this.cadena[e];
        }
        if (this.palabrasReservadas.test(palabra)) {
          if (palabra == 'for') {
            expresion = this.forr(response.detalle);
          } else if (palabra == 'if') {
            expresion = this.iff(response.detalle);
          }
          return expresion;
        } else if (this.cadena[response.detalle] == '=') {
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
            return this.textico(indice);
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
  forr = (indice) => {
    let forcompleto = "";
    for (var i = indice + 1; i < this.cadena.length; i++) {
      if (this.cadena[i] == ')') {
        break;
      }
      forcompleto += this.cadena[i];
    }
    let expresionFor = new RegExp("((^[A-z]*)([0-9]*))\\b={1}\\b((([A-z])([0-9]*))|(([A-z])|([0-9]*)))");
    let validacion = true;
    let forDividido = forcompleto.split(';');
    if (forDividido.length < 3)
      validacion = false;
    if (validacion)
      validacion = expresionFor.test(forDividido[0]);
    expresionFor = new RegExp("((^[A-z]*)([0-9]*))\\b(>=|<=|>|<){1}\\b((([A-z])([0-9]*))|(([A-z])|([0-9]*)))");
    if (validacion)
      validacion = expresionFor.test(forDividido[1]);
    expresionFor = new RegExp("\\b((^[A-z]*)([0-9]*)){1}\\b((\\+\\+|\\--)$)");
    if (validacion)
      validacion = expresionFor.test(forDividido[2]);
    return {
      estado: validacion,
      detalle: 'expresion ' + forcompleto + ' es ' + (validacion ? 'valida' : 'invalida'),
      fin: i + 1
    }
  }

  iff = (indice) => {
    let iffcompleto = "";
    for (var i = indice + 1; i < this.cadena.length; i++) {
      if (this.cadena[i] == ')') {
        break;
      }
      iffcompleto += this.cadena[i];
    }
    let expresionIf = new RegExp("((^[A-z]*)([0-9]*))(\\b>=|<=|>|<|<>{1}\\b)((([A-z]*)([0-9]*))$)");
    let validacion = expresionIf.test(iffcompleto);
    return {
      estado: validacion,
      detalle: 'expresion ' + iffcompleto + ' es ' + (validacion ? 'valida' : 'invalida'),
      fin: i + 1
    }
  }
  textico = (indice) => {
    if (this.cadena[indice+1] == '"' || this.cadena[indice+1] == "'") {
      let texto = '';
      for (var i = indice + 2; i < this.cadena.length; i++) {
        if (this.cadena[i] == '"' || this.cadena[i] == "'") {
          break;
        }
        texto += this.cadena[i];
      }
      return {
        estado: true, detalle: 'valor de la variable es: ' + texto, fin: i + 1
      }
    }
    return {
      estado: false, detalle: 'error ' , fin: indice
    }
  }
}


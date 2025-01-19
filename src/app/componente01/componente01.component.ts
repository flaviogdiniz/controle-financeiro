import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Planilha } from '../modelo/Planilha';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';



@Component({
  selector: 'app-componente01',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './componente01.component.html',
  styleUrl: './componente01.component.css'
})
export class Componente01Component {

  //Objeto de Formulário
  formulario = new FormGroup({
    data      : new FormControl(null, Validators.required),
    descricao : new FormControl('', [Validators.required, Validators.minLength(3)]),
    categoria : new FormControl('', [Validators.required, Validators.minLength(3)]),
    entrada   : new FormControl(null,  Validators.min(0)),
    saida     : new FormControl(null, Validators.min(0)),
    saldoAcumulado : new FormControl(null)
  });

  //Visibilidade dos Botôes
  btnCadastrar : boolean =true;

  //Vetor
  vetor:Planilha[] = [];

  //Armazenar inice do objeto selecionado
  indice:number = -1;

  //Valor total de entrada
  totalEntrada: number = 0;

  //Valor total de saida
  totalSaida: number = 0;


  //Saldo Total acumulado
  saldoAcumulado: number = 0;

  //Função de cadastro
  cadastrar(){

  const entrada = this.formulario.value.entrada || 0;
  const saida = this.formulario.value.saida || 0;

  // Calcular saldo acumulado para o registro atual
  const registroSaldo = this.saldoAcumulado + entrada - saida;

  // Criar novo registro com saldo acumulado
  const novoRegistro = {
    ...this.formulario.value,
    entrada,
    saida,
    saldoAcumulado: registroSaldo,
  } as Planilha;

  // Adicionar registro ao vetor
  this.vetor.push(novoRegistro);

  // Atualizar saldos totais
  this.totalEntrada += entrada;
  this.totalSaida += saida;
  this.saldoAcumulado = registroSaldo;

  // Limpar formulário
  this.formulario.reset();

   
  }

  //Função de seleção 
  selecionar(indice:number){

    //Atribuir o índice do objeto
    this.indice = indice;

    //Atribuir os dados para o formulario
    this.formulario.setValue({
      data : this.vetor[indice].data,
      descricao : this.vetor[indice].descricao,
      categoria : this.vetor[indice].categoria,
      entrada : this.vetor[indice].entrada,
      saida : this.vetor[indice].saida,
      saldoAcumulado : this.vetor[indice].saldoAcumulado
    });

    //Visibilidade dos botôes
    this.btnCadastrar = false;

  }

    //Função de alteração
    alterar() {
      
      const entrada = this.formulario.value.entrada || 0;
      const saida = this.formulario.value.saida || 0;
    
      // Obter o registro original
      const registroOriginal = this.vetor[this.indice];
    
      // Recalcular totais antes de atualizar
      this.totalEntrada -= registroOriginal.entrada;
      this.totalSaida -= registroOriginal.saida;
    
      // Calcular novo saldo acumulado
      const novoSaldoAcumulado =
        (this.indice === 0 ? 0 : this.vetor[this.indice - 1].saldoAcumulado) +
        entrada -
        saida;
    
      // Atualizar registro no vetor
      this.vetor[this.indice] = {
        ...this.formulario.value,
        entrada,
        saida,
        saldoAcumulado: novoSaldoAcumulado,
      } as Planilha;
    
      // Atualizar os saldos acumulados dos registros subsequentes
      for (let i = this.indice + 1; i < this.vetor.length; i++) {
        const anterior = this.vetor[i - 1];
        this.vetor[i].saldoAcumulado =
          anterior.saldoAcumulado + this.vetor[i].entrada - this.vetor[i].saida;
      }
    
      // Recalcular totais
      this.totalEntrada += entrada;
      this.totalSaida += saida;
      this.saldoAcumulado = this.vetor[this.vetor.length - 1].saldoAcumulado;
    
      // Limpar formulário e estado
      this.formulario.reset();
      this.btnCadastrar = true;
      this.indice = -1;
    
      
    }

    remover() {
      
      
      // Remover o registro do vetor
      this.vetor.splice(this.indice, 1);

      // Obter o registro a ser removido
      const registroRemovido = this.vetor[this.indice];
    
      // Atualizar totais
      this.totalEntrada -= registroRemovido.entrada;
      this.totalSaida -= registroRemovido.saida;
    
      
    
      // Atualizar saldos acumulados dos registros subsequentes
      for (let i = this.indice; i < this.vetor.length; i++) {
        const anterior = i === 0 ? 0 : this.vetor[i - 1].saldoAcumulado;
        this.vetor[i].saldoAcumulado =
          anterior + this.vetor[i].entrada - this.vetor[i].saida;
      }
    
      // Atualizar o saldo acumulado total
      this.saldoAcumulado =
        this.vetor.length > 0
          ? this.vetor[this.vetor.length - 1].saldoAcumulado
          : 0;
    
      // Limpar formulário e estado
      this.formulario.reset();
      this.btnCadastrar = true;
      this.indice = -1;

      //Visibilidade dos botões
      this.btnCadastrar = true;
    
      
    }
  
    //Função cancelar
    cancelar(){
      //Limpeza dos inputs
      this.formulario.reset();

      //Visibilidade dos botões
      this.btnCadastrar = true;
    }



  

    gerarPDF() {
      const pdf = new jsPDF();
    
      // Título do PDF
      pdf.setFontSize(18);
      pdf.text('Planilha Mensal de Controle Financeiro', 105, 20, { align: 'center' });
    
      // Cabeçalhos da tabela
      const headers = [['Data', 'Descrição', 'Categoria', 'Entrada (R$)', 'Saída (R$)', 'Saldo Acumulado (R$)']];
    
      // Dados da tabela
      const rows = this.vetor.map((registro) => [
        new Date(registro.data).toLocaleDateString('pt-BR'), // Data formatada
        registro.descricao,
        registro.categoria,
        registro.entrada?.toFixed(2) || '-', // Formata entrada
        registro.saida?.toFixed(2) || '-',   // Formata saída
        registro.saldoAcumulado?.toFixed(2), // Formata saldo acumulado
      ]);
    
      // Gera tabela no PDF
      autoTable(pdf, {
        head: headers,
        body: rows,
        startY: 30,
        styles: {
          fontSize: 10, // Tamanho da fonte
          cellPadding: 4, // Espaçamento interno
        },
        headStyles: {
          fillColor: [41, 128, 185], // Cor azul para o cabeçalho
          textColor: 255,            // Cor do texto (branco)
          halign: 'center',          // Alinhamento horizontal
        },
        bodyStyles: {
          halign: 'center',          // Alinhamento horizontal
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 30 }, // Data
          1: { halign: 'left', cellWidth: 30 },  // Descrição
          2: { halign: 'left', cellWidth: 30 },  // Categoria
          3: { halign: 'right', cellWidth: 30 }, // Entrada
          4: { halign: 'right', cellWidth: 30 }, // Saída
          5: { halign: 'right', cellWidth: 30 }, // Saldo Acumulado
        },
      });
    
      // Totais
      const finalY = (pdf as any).lastAutoTable.finalY + 10; // Obtém a posição final da tabela
      pdf.setFontSize(12);
      pdf.text(`Entrada Total: R$ ${this.totalEntrada.toFixed(2)}`, 14, finalY);
      pdf.text(`Saída Total: R$ ${this.totalSaida.toFixed(2)}`, 14, finalY + 10);
      pdf.text(`Saldo Acumulado: R$ ${this.saldoAcumulado.toFixed(2)}`, 14, finalY + 20);
    
      // Salva o PDF
      pdf.save('planilha-financeira.pdf');
    }
}




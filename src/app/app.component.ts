import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import * as XLSX from 'xlsx'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'prueba';
  imageSrc: string = '';
  data : Array<string> = []
  myForm = new FormGroup({
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });
  formfields = new FormControl('');
  dataFile: any;
  constructor(private http: HttpClient) { }
  get f(){
    return this.myForm.controls;
  }
  onFileChange(event:any) {
    const reader = new FileReader();
    if(event.target.files && event.target.files.length) {
      this.dataFile = event.target.files[0]
      const {name} = event.target.files[0]
      const validate = this.validateExtension(name)
      if(validate){
        this.addfile(event)
      }else{
        this.data = []
      }
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        let image = this.previewDoc(name)
        this.imageSrc = image;
      }
    }
  }
  submit(){
    const {file} = this.myForm.value
    if(!file) return
    const fields = ['Nombres', 'Apellidos', 'Direcciones', 'Telefonos']
    const validate = this.validateExtension(file)
    if(!validate){
        alert('Solo se pueden subir archivos delimitados por ".", "," o "%" y otros con espacios o palabras claves')
        return
      }
    if(!this.formfields.value && validate){
      alert('Debe seleccionar los campos del archivo a subir')
      return
    }
    if(!this.formfields.value) return
    const v : string[] = [...this.formfields.value]
    if(v.length < 4){
      alert('Falta selecionar campos')
      return
    }
    let contador = 0
    v.map((item) => {
      if(fields.includes(item)){
        contador+=1
      }
      if(!fields.includes(item)){
        alert(`El campo ${item} no es requerido`)
        if(contador > 0) contador -= 1
      }
    })
    if(contador === 4){
      const formData = new FormData()
      formData.append('file', this.dataFile)
      this.http.put('https://crm-server-jr.herokuapp.com/upload', formData)
        .subscribe((res : any) => {
          if(res.msg === 'Archivo guardado con exito'){
            alert('Informacion subida con exito');
            this.myForm.reset()
            this.data = []
            this.imageSrc = ''
          }
        })
    }
  }
  addfile(event : any){    
    const file = event.target.files[0];     
    let fileReader = new FileReader();    
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e) => {    
        const arrayBuffer : any = fileReader.result;   
        if(!arrayBuffer) return
        var dataFile = new Uint8Array(arrayBuffer);    
        var arr = new Array();    
        for(var i = 0; i != dataFile.length; ++i) arr[i] = String.fromCharCode(dataFile[i]);    
        var bstr = arr.join("");    
        var workbook = XLSX.read(bstr, {type:"binary"});   
        const workBookSheets = workbook.SheetNames;
        const sheet = workBookSheets[0]
        const dataColumns : Array<Object> = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
        const json : any = dataColumns[0]
        let contador = 0
        for(let key in json){
          this.data[contador] = key
          contador+=1
        }
    }
  } 
  validateExtension(file: string){
    const extension = file.split('.')
    const validateExtension = ['csv']
    const extensionData = extension[extension.length - 1]
    if(validateExtension.includes(extensionData)){
        return true
    }
    return false
  }
  previewDoc(file: string){
    const extension = file.split('.')
    const validateExtension = ['csv']
    const extensionData = extension[extension.length - 1]
    let image = 'https://cdn-icons-png.flaticon.com/512/610/610138.png'
    if(extensionData === 'csv') image = 'https://cdn-icons-png.flaticon.com/512/4911/4911248.png'
    if(extensionData === 'pdf') image = 'https://cdn-icons-png.flaticon.com/512/337/337946.png'
    if(extensionData === 'docx') image = 'https://cdn-icons-png.flaticon.com/512/716/716935.png'
    if(extensionData === 'txt') image = 'https://cdn-icons-png.flaticon.com/512/337/337956.png'
    return image
  }
}


import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataBackService } from '../../../services/data-back.service';
import { DataFrontService } from '../../../services/data-front.service';
import { SocketsService } from '../../../services/sockets.service';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html'
})

export class ToolsComponent implements AfterViewInit {


  @ViewChild("colorPicker") colorPicker!:ElementRef;
  @ViewChild("colorPickerBtn") colorPickerBtn!:ElementRef;
  @ViewChild("hexaColor") hexaColor!:ElementRef;
  @ViewChild("divColorPicker") divColorPicker!:ElementRef;
  
  colorPreview: any;
  currentWord: String = "madroñera"

  roomData: any;
  user: any;


  constructor(private data: DataFrontService, private backService: DataBackService, private componentElement: ElementRef, private socketService: SocketsService) {

    this.roomData = this.backService.room;
    this.user = this.backService.user;
    this.backService.roomSubscriptions.push(this.backService.roomSubject.subscribe((content: any) => {
      this.roomData = content;
      
    }));

    this.backService.roomSubscriptions.push(this.backService.userSubject.subscribe((content: any) => {
      this.user = content;
    }));
  }


  setColorBrush(color: any){
    this.data.setColorService(color);

  
  }

  setSize(value: any){
    this.data.setSizeService(value);
  }

  Clear() {
    if (this.backService.game.dynamicData.currentlyDrawingUser == this.backService.user.id) {
      this.socketService.wannaClear();
      this.data.setClearService();
    }
  }

  loadColorPicker(){
    const nativeCanvas = this.colorPicker.nativeElement;
    const nativeButton = this.colorPickerBtn.nativeElement;
    const context = nativeCanvas.getContext('2d');
    const nativeHexaColor = this.hexaColor.nativeElement;
    const nativeDivColorPicker = this.divColorPicker.nativeElement;
    const image = new Image();
    const imageSrc = 'assets/images/colorwheel5.png';

    image.onload = function () {
      context.drawImage(image, 0, 0, image.width, image.height);
    }
    
    image.src = imageSrc;




    // MOSTRAR COLOR EN BOTON Y GUARDAR EL COLOR SELECCIONADO
    nativeCanvas.addEventListener("mousemove", function (e: any) {
      let rect = e.target.getBoundingClientRect();
      let canvasX = e.offsetX || e.pageX - rect.left - window.scrollX,
        canvasY = e.offsetY || e.pageY - rect.top - window.scrollY;
      let imageData = context.getImageData(canvasX, canvasY, 1, 1);
      let pixel = imageData.data;
      let pixelColor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
      nativeButton.style.backgroundColor = pixelColor;
      let dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
      nativeHexaColor.value = '#' + ('0000' + dColor.toString(16)).substr(-6);
    });

    // nativeCanvas.addEventListener("click", function (e: any) {
    //   nativeButton.classList.add("preview")
    //   nativeButton.classList.remove("preview2")
    //   nativeDivColorPicker.style.display = "none";
    // });

    // nativeButton.addEventListener("click", function (e: any) {
    //   if (nativeDivColorPicker.style.display === "none") {
    //     nativeDivColorPicker.style.display = "block";
    //     console.log(nativeDivColorPicker.style.display)

    //   } else {
    //     nativeDivColorPicker.style.display = "none";
    //   }

    //   e.target.classList.toggle("preview")
    //   e.target.classList.toggle("preview2")


    // });


    
  }

  showingColorPicker: boolean = false;
  toggleColorPicker() {
    if (this.showingColorPicker) {
      
    } else {

    }
    this.showingColorPicker = !this.showingColorPicker;
  }
 

  ngAfterViewInit(): void {
    this.loadColorPicker();
  }

}

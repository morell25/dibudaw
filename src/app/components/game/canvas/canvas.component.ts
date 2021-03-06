import { AfterViewInit, Component, ElementRef, HostListener, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { fromEvent, PartialObserver, Observable, CompletionObserver, Subscription } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'

import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { DataFrontService } from '../../../services/data-front.service';
import { BrushSize, Color, CoursorPosition, Stroke, UserID } from '../../../../../types';
import { SocketsService } from '../../../services/sockets.service';
import { DataBackService } from '../../../services/data-back.service';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html'
})
export class CanvasComponent implements OnInit, OnDestroy{

  canvasGood: any;
  context!: CanvasRenderingContext2D;
  brushColor: String | undefined;
  brushSize: String | undefined;
  colorSubscription: any;
  sizeSubscription: any;
  clearSubscription: any;
  screenHeight: number | undefined;
  screenWidth: number | undefined;
  
  canvasSubscription: Subscription | undefined;
  

  @Input() public width: any;
  @Input() public height: any;
  @ViewChild("canvasHTML", { static: true }) public canvas!: ElementRef;

  externalDrawSubscription: Subscription;
  gameSubscription!: Subscription;

  constructor(private data: DataFrontService,  private socketsService: SocketsService, public backService: DataBackService) {
    this.externalDrawSubscription = this.socketsService.onStroke().subscribe((stroke) => {
      this.externalDraw(stroke);
    });
  }
    

  setCanvasAccess(currentlyDrawingUser: UserID) {

    if (currentlyDrawingUser == this.backService.user.id) {
      this.eventCapture(this.canvasGood);
    } else {
      this.disableEventCapture(this.canvasGood);
    }

  }


  ngAfterViewInit() {

    this.setCanvasAccess(this.backService.game.dynamicData.currentlyDrawingUser);
    this.gameSubscription = this.backService.gameSubject.subscribe((game) => {
      console.log("hay que actualizar los permisos del canvas.");
      this.setCanvasAccess(game.dynamicData.currentlyDrawingUser);
    });


  }

      @HostListener('window:resize', ['$event'])
      getScreenSize(event?:Event) {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;

        this.width = window.innerWidth/1.80;
        this.height=window.innerHeight/1.28;
        // console.log(this.screenHeight, this.screenWidth);
      }

      ngOnInit(): void {
        
        
        this.getScreenSize();

          this.canvasGood = this.canvas.nativeElement;
        this.context = this.canvasGood.getContext('2d');

        //nooo donde te sentaste, este es siempre fijo
         // this.canvasGood.width = this.width;
          //this.canvasGood.height = this.height;
      
          
          this.context.lineWidth = 3;
          this.context.lineCap = "round";
          this.context.strokeStyle=this.data.color;
          

          this.colorSubscription=this.data.colorChange.subscribe((e) =>{
            this.context.strokeStyle=e;
          })
      
          this.context.lineWidth=this.data.brushSize;
          this.colorSubscription=this.data.brushSizeChange.subscribe((e) =>{
            this.context.lineWidth=e;
          })
      
          this.clearSubscription=this.data.clearChange.subscribe((e)=>{
            this.context.clearRect(0,0, this.width, this.height);
          })
          
         
        }


  public disableEventCapture(canvasC: HTMLCanvasElement) {
    console.log("ejecutamos disableEventCapture()");
    this.canvasSubscription?.unsubscribe();
    this.canvasSubscription = undefined;
  }

  public eventCapture(canvasC: HTMLCanvasElement) {
    if (this.canvasSubscription == undefined) {
      console.log('ejecutamos eventCapture()');
      const mousedown$ = fromEvent(canvasC, 'mousedown');

      this.canvasSubscription = mousedown$.pipe(
        switchMap((e) => {
          return fromEvent(canvasC, 'mousemove')
            .pipe(
              takeUntil(fromEvent(canvasC, 'mouseup')),
              takeUntil(fromEvent(canvasC, 'mouseleave')),
              pairwise()
            )
        })
      )

        .subscribe((res: any[]) => {
      
          //magia
          //tenemos prevPos y currentPos con p??xeles relativos a la esquinaa superior izquierda del canvas, ahora no la cagues
          function getTransformedPosition(res:any) {
            let rect = canvasC.getBoundingClientRect();
            let scaleX = canvasC.width / rect.width;
            let scaleY = canvasC.height / rect.height;
            return {
              x: (res.clientX - rect.left) * scaleX,
              y: (res.clientY - rect.top) * scaleY
            }
          }
          let prevPos = getTransformedPosition(res[0]);
          let currentPos = getTransformedPosition(res[1]);
          this.draw(prevPos, currentPos);
          this.socketsService.wannaStroke({
            pp: prevPos, cp: currentPos, c: String(this.context.strokeStyle), s: this.context.lineWidth
          });

        });
    }
  }

 

  private draw(prevPos: CoursorPosition, currentPos: CoursorPosition)
    {
      if (!this.context) { return; }
      this.context.beginPath();

      
      if (prevPos) {
        this.context.moveTo(prevPos.x, prevPos.y);
        this.context.lineTo(currentPos.x, currentPos.y);
        this.context.stroke();
      }
  }

  externalDraw(stroke: Stroke) {
    this.context.strokeStyle = stroke.c;
    this.context.lineWidth = stroke.s;
    this.draw(stroke.pp, stroke.cp);
  }

    
  
    
    ngOnDestroy(){
      
      this.colorSubscription?.unsubscribe();
      this.gameSubscription?.unsubscribe();
    
}
}

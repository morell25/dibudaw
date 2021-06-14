import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataFrontService } from '../../services/data-front.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {


  colorChangeSubscription!: Subscription;
  constructor(private componentElement: ElementRef, private frontService: DataFrontService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    this.colorChangeSubscription = this.frontService.colorChange.subscribe((color) => {
      if (color == 'white') {
        this.componentElement.nativeElement.querySelector('#canvas').style.cursor = "url(assets/images/eraser2.png), auto";
      }
      else {
        this.componentElement.nativeElement.querySelector('#canvas').style.cursor = "url(assets/images/pencil.png), auto";
      }
    });


  // for (let element of this.componentElement.nativeElement.querySelectorAll('.color')){
  //   element.addEventListener('click', () => {
  //     this.componentElement.nativeElement.querySelector('#canvas').style.cursor="url(assets/images/pencil.png), auto"
  //   });
  // }

  // for (let element of this.componentElement.nativeElement.querySelectorAll('.eraser')){
  //   element.addEventListener('click', () => {
  //     this.componentElement.nativeElement.querySelector('#canvas').style.cursor="url(assets/images/eraser2.png), auto"
  //   });
  // }
}

ngOnDestroy(){
  this.colorChangeSubscription.unsubscribe();
  
}

}

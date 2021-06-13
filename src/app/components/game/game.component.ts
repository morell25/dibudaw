import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit, AfterViewInit {

  constructor(private componentElement: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
  for (let element of this.componentElement.nativeElement.querySelectorAll('.color')){
    element.addEventListener('click', () => {
      this.componentElement.nativeElement.querySelector('#canvas').style.cursor="url(assets/images/pencil.png), auto"
    });
  }

  for (let element of this.componentElement.nativeElement.querySelectorAll('.eraser')){
    element.addEventListener('click', () => {
      this.componentElement.nativeElement.querySelector('#canvas').style.cursor="url(assets/images/eraser2.png), auto"
    });
  }
}

}

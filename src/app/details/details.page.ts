import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IonContent, IonList, IonSlides, isPlatform } from '@ionic/angular';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  data = null;
  
  opts = {
    freeMode: true,
    slidesPerView: 2.6,
    slidesOffsetBefore: 30,
    slidesOffsetAfter: 100
  }
 
  activeCategory = 0;
  @ViewChildren(IonList, { read: ElementRef }) lists: QueryList<ElementRef>;
  listElements = [];
  @ViewChild(IonSlides) slides: IonSlides;
  @ViewChild(IonContent) content: IonContent;
  categorySlidesVisible = false;
  showSearchBar = false

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { }
 
  ngOnInit() {
    this.http.get('https://devdactic.fra1.digitaloceanspaces.com/foodui/1.json').subscribe((res: any) => {
      this.data = res;
      console.log(this.data)
    });
 
    const headerHeight = isPlatform('ios') ? 44 : 56;    
    this.document.documentElement.style.setProperty('--header-position', `calc(env(safe-area-inset-top) + ${headerHeight}px)`);
  }
 
  ngAfterViewInit() {    
    this.lists.changes.subscribe(_ => { 
      this.listElements = this.lists.toArray();
    });
  }
 
  selectCategory(index) {
    const child = this.listElements[index].nativeElement;    
    this.content.scrollToPoint(0, child.offsetTop - 120, 1000);
  }

  onSearch(search) {
    const query = search.target.value.toLowerCase();
    const searchbar = document.querySelector('ion-searchbar');
    let food = this.data.food;

    // console.log(food)
    function animation() {
      requestAnimationFrame(() => {
        food.forEach((item) => {
          // console.log(item)
          item.meals.forEach(element => {
            console.log(element.textContent)
            const shouldShow = element.name.toLowerCase().indexOf(query) > -1;
            item.style.display = shouldShow ? 'block' : 'none';
            
          });
        });
      });
    } 
    
    searchbar.addEventListener('ionInput', animation);
  }
  
  onShowSearchBar() {
    this.showSearchBar = this.showSearchBar ? false : true
  }
 

  onScroll(ev) {    
    const offset = ev.detail.scrollTop;
    this.categorySlidesVisible = offset > 500;
    
    for (let i = 0; i < this.listElements.length; i++) {
      const item = this.listElements[i].nativeElement;
      if (this.isElementInViewport(item)) {
        this.activeCategory = i;
        this.slides.slideTo(i);
        break;
      }
    }
  }
 
  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    
    return (
      rect.top >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
  }
}

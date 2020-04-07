import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f') form: NgForm;

  private editSubscription: Subscription;
  public editMode: boolean = false;
  private editedItemIndex: number;
  
  public editedItem: Ingredient;


  constructor(private slService: ShoppingListService) { }
  
  ngOnDestroy(): void {
    this.editSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.editSubscription = this.slService.startedEditing.subscribe(
      (id: number) => {
        this.editMode = true;
        this.editedItemIndex = id;
        this.editedItem = this.slService.getIngredient(id);
        this.form.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        });
    });
  }

  onSubmit(form: NgForm): void {
    const formValues = form.value;    
    const ing: Ingredient = new Ingredient(formValues.name, +formValues.amount);
    if (this.editMode){
      this.slService.updateIngredient(this.editedItemIndex, ing);
    } else {
      this.slService.addIngredient(ing);
    }
    this.onClear();
  }

  onClear(): void {
    this.form.reset();
    this.editMode = false;
  }

  onDelete() : void {
    this.slService.deleteIngredient(this.editedItemIndex);
    this.onClear();
  }

}

import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http'
import { RecipeService } from '../recipes/recipe.service';
import { Recipe } from '../recipes/recipe.model';

import { map, tap } from 'rxjs/operators'

@Injectable({
    providedIn: 'root'
})
export class DataStorageService{

    private api = 'https://angulardemo-b5ab7.firebaseio.com/';

    constructor(private http: HttpClient,
        private recipeService: RecipeService) {}

    storeRecipes() {
        const recipes = this.recipeService.getRecipes();
        return this.http.put(`${this.api}/recipes.json`, recipes)
            .subscribe(response => {
                console.log(response);
            })
    }

    fetchRecipes() {
        return this.http.get<Recipe[]>(`${this.api}/recipes.json`)
            .pipe(map(responseData => {
                return responseData.map(recipe => {
                    return {
                        ...recipe,
                        ingredients: recipe.ingredients ? recipe.ingredients : []
                    }
                })
            }),
            tap(recipes => {
                this.recipeService.setRecipes(recipes)
            }));
    }

}
/**
 * Copyright 2020 Amazon.com, Inc. and its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
 * 
 * Licensed under the Amazon Software License (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 * 
 * http://aws.amazon.com/asl/
 * 
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
**/
'use strict';

const daily_menus = {
  sunday : {
    breakfast : {
      menu: {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      }
    },
    lunch : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      drinks : "large iced tea",
    },
    dinner : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      drinks : "2 liter coke",
    }
  },
  monday : {
    breakfast : {
      menu: {
        breakfast: "Selection of cereals",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      }
    },
    lunch : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Salmon Fishcakes with boiled potatoes and peas",
        dinner: "Homemade Soup of the Day"
      },
      drinks : "diet coke",
    },
    dinner : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Chicken Goujons or Jacket Potatoes with a choice of fillings"
      },
      drinks: "2 liter sprite",
    }
  },
  tuesday : {
    breakfast : {
      menu: {
        breakfast: "Toasts and preserves",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      }
    },
    lunch : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Wild Berry Eton Mess",
        dinner: "Homemade Soup of the Day"
      },
      drinks : "sprite",
    },
    dinner : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Apple and Raspberry Crumble with custard"
      },
      drinks: "one liter San Pelligrino",
    }
  },
  wednesday : {
    breakfast : {
      menu: {
        breakfast: "Yoghurts",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      }
    },
    lunch : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      drinks : "large iced tea",
    },
    dinner : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      drinks : "2 liter diet coke",
    }
  },
  thursday : {
    breakfast : {
      menu: {
        breakfast: "Porridge",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      }
    },
    lunch : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      salad : "small house salad",
      drinks : "diet coke",
    },
    dinner : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      drinks: "a two liter sprite",
    }
  },
  friday : {
    breakfast : {
      menu: {
        breakfast: "Fresh fruit",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      }
    },
    lunch : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      drinks: "iced tea",
    },
    dinner : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      drinks : "2 liter coke",
    }
  },
  saturday : {
    breakfast : {
      menu: {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      }
    },
    lunch : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      drinks : "large iced tea",
    },
    dinner : {
      menu : {
        breakfast: "Cooked Breakfast",
        lunch: "Beef in Ale Pie with mashed potato and seasonal vegetables",
        dinner: "Homemade Soup of the Day"
      },
      drinks: "two, two liter cokes",
    }
  }
};

const specials = [
  { 
    name : "three cheese delight", 
    qty: 1, 
    menu: { 
      size: "large", 
      crust: "deep dish",
      cheese : "extra", 
    }
  },
  { 
    name : "pepperoni party", 
    qty: 1, 
    menu : {
      size: "extra large",
      crust: "regular",
      cheese : "extra", 
    }
  },
  {
    name : "meat lovers", 
    qty: 1, 
    menu : {
      size: "large",
      crust: "regular",
      cheese : "light", 
    }
  },
  {
    name : "veggie supreme", 
    qty: 1, 
    menu: {
      size: "large",
      crust: "thin",
      cheese : "normal", 
    }
  },
  {
    name : "kitchen sink", 
    qty: 1, 
    menu: {
      size: "extra large",
      crust: "deep dish",
      cheese : "extra", 
    }
  },
  {
    name : "two medium, two topping pizzas", 
    qty: 2, 
    menu: {
      size: "medium",
      crust: "regular",
      cheese: "normal", 
    }
}];

const drinks = [
  {name: "iced tea"},
  {name: "lemonade"},
  {name: "sprite"},
  {name: "water"},
  {name: "pepsi"},
  {name: "diet coke"},
  {name: "coke"},
  {name: "two liter coke"},
  {name: "two liter diet coke"},
  {name: "two liter sprite"},
  {name: "two liter pepsi"}
]

const generateOrderText = (order) => {
  let orderText = ""

  if (order.special){
    orderText = "a " + order.special.name + " special that comes with ";
    orderText += order.special.qty + " " + order.special.menu.size + " ";
    let speakableToppings = order.special.menu.toppingsList;
    let lastTopping = " and " + speakableToppings.pop();
    orderText += speakableToppings.join(", ") + lastTopping + " menu";
    orderText += " on " + order.special.menu.crust + " crust";
    orderText += " with " + order.special.menu.cheese + " cheese";
  }

  if (order.menu){
      orderText += "for breakfast " + order.menu.breakfast + " ";
      orderText += ", for lunch " + order.menu.lunch + " ";
      orderText += " and for dinner " + order.menu.dinner + " ";
  } 

  if (order.drinks){
      if (orderText != null){
          orderText += ", ";
      }
      orderText += "a " + order.drinks;
  }

  return orderText;
}

const getDailySpecialForPeriod = (day, period) => {
  return daily_menus[day][period];
};

const getPizzaReferenceSpecials = () => {
    return specials.map(function (special) {
        return special.name
      })
}
const getSpecialPizzaDetails = (specialPizzaName) => {
    console.log("In getSpecialPizzaDetails, looking for: " + specialPizzaName);
    if (!getPizzaReferenceSpecials().includes(specialPizzaName)){
        return null;
    }
    let special = specials.find(special => 
      (special.name.toLowerCase() === specialPizzaName) || (special.name.toLowerCase().includes(specialPizzaName)));
    return special;
}

const getDrinks = () => {
  return drinks.map(drink => drink.name);
}
const makeSpeakableList =  (list) => {
  if (list.length > 1){
    let last = " and " + list.pop();
    return list.join(", ") + last;
  }
  return list;
  
}
module.exports = { 
  getDailySpecialForPeriod,
  getPizzaReferenceSpecials, 
  getSpecialPizzaDetails, 
  getDrinks,
  generateOrderText,
  makeSpeakableList
};

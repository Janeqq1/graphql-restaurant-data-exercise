var { graphqlHTTP } = require("express-graphql");
var { buildSchema, assertInputType } = require("graphql");
var express = require("express");

// Construct a schema, using GraphQL schema language
var restaurants = [
  {
    id: 1,
    name: "WoodsHill ",
    description:
      "American cuisine, farm to table, with fresh produce every day",
    dishes: [
      {
        name: "Swordfish grill",
        price: 27,
      },
      {
        name: "Roasted Broccily ",
        price: 11,
      },
    ],
  },
  {
    id: 2,
    name: "Fiorellas",
    description:
      "Italian-American home cooked food with fresh pasta and sauces",
    dishes: [
      {
        name: "Flatbread",
        price: 14,
      },
      {
        name: "Carbonara",
        price: 18,
      },
      {
        name: "Spaghetti",
        price: 19,
      },
    ],
  },
  {
    id: 3,
    name: "Karma",
    description:
      "Malaysian-Chinese-Japanese fusion, with great bar and bartenders",
    dishes: [
      {
        name: "Dragon Roll",
        price: 12,
      },
      {
        name: "Pancake roll ",
        price: 11,
      },
      {
        name: "Cod cakes",
        price: 13,
      },
    ],
  },
];
var schema = buildSchema(`
type Query{
  restaurant(id: Int): restaurant
  restaurants: [restaurant]
},
type restaurant {
  id: Int
  name: String
  description: String
  dishes:[Dish]
}
type Dish{
  name: String
  price: Int
}
input restaurantInput{
  name: String
  description: String
}
type DeleteResponse{
  ok: Boolean!
}
type Mutation{
  setrestaurant(input: restaurantInput): restaurant
  deleterestaurant(id: Int!): DeleteResponse
  editrestaurant(id: Int!, name: String!): restaurant
}
`);
// The root provides a resolver function for each API endpoint

var root = {
  restaurant: (arg) => {
    // Your code goes here
    var myRes = restaurants.filter(item=>item.id==arg.id);
    return myRes[0];
  },
  restaurants: () => {
    // Your code goes here
    return restaurants;
  },
  setrestaurant: ({ input }) => {
    // Your code goes here
    restaurants.push({name:input.name, description:input.description});
    return input;
  },
  deleterestaurant: ({ id }) => {
    // Your code goes here
    const ok = Boolean(true);
    var toBeDel = restaurants.filter(item=>item.id==id);
    if (toBeDel.length<1) {
      throw new Error("restaurant doesn't exist");
    }

    console.log("Deleting " + JSON.stringify(toBeDel[0]));
    restaurants = restaurants.filter(item=>item.id!=id);
    return {ok};
  },
  editrestaurant: ({ id, ...restaurant }) => {
    // Your code goes here
    var found = false;
    var idx = 0;

    restaurants = restaurants.map((item, index)=>{
      if (item.id == id) {
        found = true;
        idx = index;
        console.log("Found: " + JSON.stringify(item));
        item = {...item, ...restaurant};
        return item;
      } else {
        return item;
      }
    });

    if (!found) {
      throw new Error("Restaurant not found");
    } else {
      console.log("Restaurant changed to: " + JSON.stringify(restaurants[idx]));
      return restaurants[idx];
    }
  },
};
var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
var port = 5500;
app.listen(5500, () => console.log("Running Graphql on Port:" + port));

//export default root;

/* The 5 GRAPHQL queries/mutations
query getrestaurants {
  restaurants {
    id
    name
    description
    dishes {
      name
      price
    }
}}

query getrestaurant($idd: Int = 1) {
  restaurant(id: $idd) {
    name
    description
    dishes {
      name
      price
    }
  }
}

mutation editrestaurant($idd: Int=1, $name: String = "OLDO") {
  editrestaurant(id: $idd, name: $name) {
    name
    description
  }
}

mutation setrestaurants {
  setrestaurant(input:{
    name: "Granite",
    description: "American"
  }) {
    name
    description
  }
}

mutation deleterestaurants($idd: Int=1) {
  deleterestaurant(id: $idd) {
    ok
  }
}

*/

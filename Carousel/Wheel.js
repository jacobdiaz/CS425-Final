class Wheel {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    // Pick 8 random colors for the carts
    let cartColors = this.randomCartColors();

    // Transform the cart scale/rotate
    const cartScale = mult(rotate(90, [0, 0, 1]), scalem(0.8, 2.5, 0.8));
    // const cartScale = mult(rotate(90, [0, 0, 1]), scalem(2, 2, 2));

    // Each carts positions
    let cartTranslation = [
      [3.5, 8, 1.5],
      [3.5, 1.5, -8],
      [3.5, -8, -1.5],
      [3.5, -1.5, 8],

      [3.5, 4.5, 6.5],
      [3.5, 6.5, -4.5],
      [3.5, -6.5, 4.5],
      [3.5, -4.5, -6.5],
    ];

    // Populate the car with new new cylinders or squares + their transformations
    this.cartXform = [];
    this.cart = [];

    for (let i = 0; i < 8; i++) {
      // Cart transformation to all 8 carts
      this.cartXform[i] = mult(translate(cartTranslation[i][0], cartTranslation[i][1], cartTranslation[i][2]), cartScale);
      this.cart[i] = new Cylinder(12, gl, program, cartColors[i], 0);
      // this.cart[i] = new Sphere(gl, program, 20, 20, cartColors[i]);
    }
  }

  render(time, position, speed) {
    // Rotate the wheel 1/3 of the speed of the Carousel
    const originalSpeed = time / 3;
    let wheel_rotation = rotateX(originalSpeed * speed);
    let wheel_translation = mat4();

    // Set the wheel to the parameter position
    wheel_translation = translate(position[0], position[1], position[2]);
    wheel_translation = mult(wheel_translation, rotateY(23));

    // perform wheel transformation
    let wheel_Xform = mult(wheel_translation, wheel_rotation);

    const uModelXform = gl.getUniformLocation(program, "uModelXform");
    const vNormalTransformation = gl.getUniformLocation(program, "vNormalTransformation");

    // Put together each carts transformation
    for (let i = 0; i < 8; i++) {
      let ptransformation = mult(wheel_Xform, this.cartXform[i]);
      gl.uniformMatrix4fv(uModelXform, false, flatten(ptransformation));
      let pnormalTransformation = normalMatrix(ptransformation, true);
      gl.uniformMatrix3fv(vNormalTransformation, false, flatten(pnormalTransformation));
      this.cart[i].render();
    }
  }

  // Returns a 8 random color arrray of vec3
  randomCartColors = () => {
    // Range is small to keep the colors dark
    let colors = [];
    const min = 0.0;
    const max = 0.7;
    for (let i = 0; i < 8; i++) {
      colors[i] = [Math.random() * (max - min) + min, Math.random() * (max - min) + min, Math.random() * (max - min) + min];
    }
    return colors;
  };
}

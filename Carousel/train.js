class Train {
  constructor(gl, program) {
    let distance = 60; // Radius of the train route

    let cylTranslation = [
      [distance, 2.5, 1.5], // center chasis
      [distance, 2.5, 4.5], // Front grill
      [distance - 6, 1.5, 1.5], //wheel
      [distance + 6, 1.5, 1.5], // wheel
      [distance, 2.5, -2.5], // top smoke stack
    ];

    let scales = [
      scalem(2, 8, 2), //front
      scalem(1.6, 4, 1.6), //center chasis
      scalem(0.5, 8, 0.5), // wheel
      scalem(0.5, 8, 0.5), //wheel
      scalem(0.5, 4, 0.5), //wheel
    ];

    var axes = [
      [-1, 0, 0], // Laying flat
      [-1, 0, 0], // Laying flat
      [-1, 0, 0], // Laying flat
      [-1, 0, 0], // Laying flat
      [0, 1, 0], // Pointing to sky
    ];

    let colors = [
      [0.3, 0.3, 0.3], // grey
      [0.1, 0.1, 0.1], // dark grey
      [0.6, 0.6, 0.6], // light grey
      [0.6, 0.6, 0.6], // light grey
      [0.8, 0.3, 0.3], // redish
    ];

    let cylScale = scalem(2, 2, 2);

    this.cyls = [];
    this.cylinders = [];
    this.cylXform = [];

    // Perform the cyl transformations for each of the 4 cyls
    for (let i = 0; i < 5; i++) {
      let cylRot = rotate(90, axes[i]);
      let cylTrans = translate(cylTranslation[i][0], cylTranslation[i][1], cylTranslation[i][2]);
      let Xform = mult(cylRot, cylScale);
      Xform = mult(Xform, scales[i]);
      this.cyls[i] = new Cylinder(8, gl, program, colors[i]);
      this.cylXform[i] = mult(cylTrans, Xform);
    }
  }

  render(time, position, speed) {
    const originalSpeed = -time / 1.5;
    let train_rotation = rotateY(originalSpeed * speed);
    let train_translation = mat4();

    train_translation = translate(position[0], position[1], position[2]);

    let train_Xform = mult(train_translation, train_rotation);
    let uModelXform = gl.getUniformLocation(program, "uModelXform");
    let vNormalTransformation = gl.getUniformLocation(program, "vNormalTransformation");

    for (let i = 0; i < 5; i++) {
      let htransformation = mult(translate(0, 0, 0), this.cylXform[i]);
      htransformation = mult(train_Xform, htransformation);
      gl.uniformMatrix4fv(uModelXform, false, flatten(htransformation));
      let hnormalTransformation = normalMatrix(htransformation, true);
      gl.uniformMatrix3fv(vNormalTransformation, false, flatten(hnormalTransformation));
      this.cyls[i].render();
    }
  }
}

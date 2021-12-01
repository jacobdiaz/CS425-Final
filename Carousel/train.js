class Train {
  constructor(gl, program) {
    this.program = program;
    this.gl = gl;

    // #region Colors
    let coneColors = vec3(1, 1, 1);
    // #endregion

    let distance = 60;
    // #region Translations
    let coneTranslation = [
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
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
    ];

    let colors = [
      [0.3, 0.3, 0.3],
      [0.1, 0.1, 0.1], // grey
      [0.6, 0.6, 0.6],
      [0.6, 0.6, 0.6],
      [0.8, 0.3, 0.3],
    ];

    let coneScale = scalem(2, 2, 2);

    this.cones = [];
    this.cylinders = [];
    this.coneXform = [];

    // Perform the cone transformations for each of the 4 cones
    for (let i = 0; i < 5; i++) {
      let coneRot = rotate(90, axes[i]);
      let coneTrans = translate(coneTranslation[i][0], coneTranslation[i][1], coneTranslation[i][2]);
      let Xform = mult(coneRot, coneScale);
      Xform = mult(Xform, scales[i]);
      this.cones[i] = new Cylinder(8, gl, program, colors[i]);
      this.coneXform[i] = mult(coneTrans, Xform);
    }
  }

  render(time, position) {
    let train_rotation = rotateY(-time / 1.5); // Get the rotation matrix of the train
    let train_translation = mat4();

    // If given valid position, set the translate matrix, otherwise ignore
    train_translation = translate(position[0], position[1], position[2]);

    let train_Xform = mult(train_translation, train_rotation); // The overall train transformation
    let uModelXform = gl.getUniformLocation(program, "uModelXform");
    let vNormalTransformation = gl.getUniformLocation(program, "vNormalTransformation");

    for (let i = 0; i < 5; i++) {
      // Generates the overall transformation of the cone relative to the train and moves it up and down
      let htransformation = mult(translate(0, 0, 0), this.coneXform[i]);
      // Combine with the train transformation to get final position of the cone, render it
      htransformation = mult(train_Xform, htransformation);
      gl.uniformMatrix4fv(uModelXform, false, flatten(htransformation));
      let hnormalTransformation = normalMatrix(htransformation, true);
      gl.uniformMatrix3fv(vNormalTransformation, false, flatten(hnormalTransformation));
      this.cones[i].render();
    }
  }
}

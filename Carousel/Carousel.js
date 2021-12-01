class Carousel {
  constructor(gl, program) {
    this.program = program;
    this.gl = gl;

    // #region Colors
    let coneColors = this.randomHorseColor();
    let cylinderColors = this.randomHorseColor();
    let baseColor = this.randomBaseColor();
    // #endregion

    // #region Translations
    let coneTranslation = [
      [4, 3.5, 1.5],
      [1.5, 3.5, -4],
      [-4, 3.5, -1.5],
      [-1.5, 3.5, 4],
    ];

    let cylinderTranslation = [
      [4, 0, 1],
      [1, 0, -4],
      [-4, 0, -1],
      [-1, 0, 4],
    ];

    let axes = [
      [-1, 0, 0],
      [0, 0, 1],
      [1, 0, 0],
      [0, 0, -1],
    ];
    // #endregion

    let cylinderScale = scalem(0.3, 8, 0.3);
    let coneScale = scalem(0.8, 2, 0.8);

    // The tranformation matrices for the carousel parts
    this.baseDepthXTransform = mult(translate(0, -0.4, 0), scalem(5, 0.5, 5));
    this.baseXTransform = mult(translate(0, 0.1, 0), scalem(5, 0.2, 5));
    this.topXTranmsform = mult(translate(0, 8, 0), scalem(6, 2, 6));
    this.midXTransform = scalem(0.8, 8, 0.8);

    // Carousel Frame consists of a base acylindar, a top acylindar, and a middle acylindar
    this.base = new Cone(60, gl, program, baseColor);
    this.centerPole = new Cylinder(25, gl, program, baseColor, 1.0);
    this.top = new Cone(10, gl, program, vec3(0.6, 0.4, 0.6));

    this.cones = [];
    this.cylinders = [];
    this.coneXform = [];

    // Perform the cylinder transformations for each of the 4 cylinders, reuse the cone colors
    this.cylindersXform = [];
    for (let i = 0; i < 4; i++) {
      this.cylindersXform[i] = mult(
        translate(cylinderTranslation[i][0], cylinderTranslation[i][1], cylinderTranslation[i][2]),
        cylinderScale
      );
      this.cylinders[i] = new Cylinder(12, gl, program, cylinderColors[i], 0);
    }

    // Perform the cone transformations for each of the 4 cones
    for (let i = 0; i < 4; i++) {
      let coneRot = rotate(90, axes[i]);
      let coneTrans = translate(coneTranslation[i][0], coneTranslation[i][1], coneTranslation[i][2]);
      let Xform = mult(coneRot, coneScale);
      this.cones[i] = new Cone(8, gl, program, coneColors[i]);
      this.coneXform[i] = mult(coneTrans, Xform);
    }
  }

  render(time, position) {
    let carousel_rotation = rotateY(time); // Get the rotation matrix of the carousel
    let carousel_translation = mat4();

    // If given valid position, set the translate matrix, otherwise ignore
    carousel_translation = translate(position[0], position[1], position[2]);

    let carousel_Xform = mult(carousel_translation, carousel_rotation); // The overall carousel transformation

    let uModelXform = gl.getUniformLocation(program, "uModelXform");
    let vNormalTransformation = gl.getUniformLocation(program, "vNormalTransformation");

    // Transform the Bottom base of the carousel
    let btransformation = mult(carousel_Xform, this.baseXTransform);
    gl.uniformMatrix4fv(uModelXform, false, flatten(btransformation));
    let bnormalTransformation = normalMatrix(btransformation, true);
    gl.uniformMatrix3fv(vNormalTransformation, false, flatten(bnormalTransformation));
    this.base.render();

    // Transform the Bottom Depth cylinder of the carousel
    let bdtransformation = mult(carousel_Xform, this.baseDepthXTransform);
    gl.uniformMatrix4fv(uModelXform, false, flatten(bdtransformation));
    let bdnormalTransformation = normalMatrix(bdtransformation, true);
    gl.uniformMatrix3fv(vNormalTransformation, false, flatten(bdnormalTransformation));
    this.centerPole.render();

    // Transform the Top piece and render it
    let ttransformation = mult(carousel_Xform, this.topXTranmsform);
    gl.uniformMatrix4fv(uModelXform, false, flatten(ttransformation));
    let tnormalTransformation = normalMatrix(ttransformation, true);
    gl.uniformMatrix3fv(vNormalTransformation, false, flatten(tnormalTransformation));
    this.top.render();

    // Transform the Middle piece and render it
    let mtransformation = mult(carousel_Xform, this.midXTransform);
    gl.uniformMatrix4fv(uModelXform, false, flatten(mtransformation));
    let mnormalTransformation = normalMatrix(mtransformation, true);
    gl.uniformMatrix3fv(vNormalTransformation, false, flatten(mnormalTransformation));
    this.centerPole.render();

    for (let i = 0; i < 4; i++) {
      // Combine with the carousel transformation to get final position of the cylinder, render it
      let ptransformation = mult(carousel_Xform, this.cylindersXform[i]);
      gl.uniformMatrix4fv(uModelXform, false, flatten(ptransformation));
      let pnormalTransformation = normalMatrix(ptransformation, true);
      gl.uniformMatrix3fv(vNormalTransformation, false, flatten(pnormalTransformation));
      this.cylinders[i].render();
    }

    for (let i = 0; i < 4; i++) {
      // Generates the overall transformation of the cone relative to the carousel and moves it up and down
      let htransformation = mult(translate(0, Math.sin(0.05 * (time + i * 90)), 0), this.coneXform[i]);

      // Combine with the carousel transformation to get final position of the cone, render it
      htransformation = mult(carousel_Xform, htransformation);
      gl.uniformMatrix4fv(uModelXform, false, flatten(htransformation));
      let hnormalTransformation = normalMatrix(htransformation, true);
      gl.uniformMatrix3fv(vNormalTransformation, false, flatten(hnormalTransformation));
      this.cones[i].render();
    }
  }

  randomHorseColor = () => {
    let colors = [];
    let row;
    for (let i = 0; i < 4; i++) {
      row = [];
      for (let j = 0; j < 4; j++) {
        j === 3 ? colors.push(row) : row.push(Math.random()); // If j = 3 push to the row else push that row to the colors array
      }
    }
    console.log(colors);
    return colors;
  };
  randomBaseColor = () => {
    const min = 0.3;
    const max = 0.9;
    return vec3(Math.random() * (max - 0.5) + 0.5, Math.random() * (max - min) + min, Math.random() * (max - 0.5) + 0.5);
    // return vec3(0.8, 0, 0);
  };
}

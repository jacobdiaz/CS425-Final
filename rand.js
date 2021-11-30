let eye = vec4(20.0, 2.0, 15.0);
let originalEye = vec4(30.0, 2.0, 15.0);
let cameraXform = mat4(); // The camera transformation matrix
let lookEYE = vec3(-3, 3, -3); // The camera eye is positioned
let lookAT = vec3(3, 0, 3); // The point at which the camera is pointed
let lookUP = vec3(0, 1, 0); // Restricts location about the eye->at vector
let viewXform;

window.onload = init = () => {
  // Create the 3D to 2D projection matrix using perspective( ) and send it to the GPU
  let projection = perspective(50, aspectRatio, 0.5, 100.0);
  let uProjectionLoc = gl.getUniformLocation(program, "uProjection");
  gl.uniformMatrix4fv(uProjectionLoc, false, flatten(projection));

  // Set the normal transformation matrix as a mat3 Identity matrix and send it to the GPU
  let normalTransformation = mat3();
  let vNormalTransformation = gl.getUniformLocation(program, "vNormalTransformation");
  gl.uniformMatrix3fv(vNormalTransformation, false, flatten(normalTransformation));

  carousel = new Carousel(gl, program);

  render();
};

let time = 0;
function render() {
  // Create viewXform using lookAt( eye, eye+at, up ) and push it to the GPU
  viewXform = lookAt(lookEYE, add(lookEYE, lookAT), lookUP);
  viewXform = mult(cameraXform, viewXform); // Modify the camera view model matrix as we move around with user input
  let uViewXform = gl.getUniformLocation(program, "uViewXform");
  gl.uniformMatrix4fv(uViewXform, false, flatten(viewXform));
  //#endregion

  // Grab our uniforms
  let uNormalMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

  gl.uniformMatrix3fv(uNormalMatrixLoc, false, flatten(calcNormalMatrix(viewXform, lightXform)));
  time += 1;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  carousel.render(time, [8, -2, 15]); // Redraw the

  requestAnimFrame(render); // Continously loop through this render function
}

function calcNormalMatrix(viewXform, modelXform) {
  var modelView = mult(viewXform, modelXform);
  var N = mat3();
  for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) N[i][j] = modelView[i][j];
  return transpose(inverse3(N));
}

function moveCamera(event) {
  switch (event.key) {
    case "a":
      var newXform = mat4();
      newXform = rotateY(-0.02);
      cameraXform = mult(newXform, cameraXform);
      var direction = vec3(Math.cos(radians(-2)), 0, Math.sin(radians(-2)));
      lookAT = add(direction, lookAT);
      break;
    case "s":
      lookEYE = subtract(lookEYE, mult(vec3(0.1, 0, 0.1), lookAT));
      break;
    case "d":
      var newXform = mat4();
      newXform = rotateY(0.02);
      cameraXform = mult(newXform, cameraXform);
      var direction = vec3(Math.cos(radians(2)), 0, Math.sin(radians(2)));
      lookAT = subtract(lookAT, direction);
      break;
    case "w":
      lookEYE = add(lookEYE, mult(vec3(0.1, 0, 0.1), lookAT));
      break;
  }
}
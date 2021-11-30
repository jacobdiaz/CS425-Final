let program; // The shader program
let gl; // WebGL graphics environment
let carousel;
let wheel;
let sign;

// Camera variables
let eye = vec4(20.0, 2.0, 15.0);
let originalEye = vec4(30.0, 2.0, 15.0);
let cameraXform = mat4(); // The camera transformation matrix
let lookEYE = vec3(-3, 3, -3); // The camera eye is positioned
let lookAT = vec3(3, 0, 3); // The point at which the camera is pointed
let lookUP = vec3(0, 1, 0); // Restricts location about the eye->at vector
let viewXform;

window.onload = init = () => {
  // Configure WebGL
  configureWebGl();

  webglLessonsUI.setupSlider("#shininess", { value: 1, slide: updateShininess, min: 0.0, max: 500.0 });

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Create the 3D to 2D projection matrix using perspective( ) and send it to the GPU
  let projection = perspective(50, aspectRatio, 0.5, 100.0);
  let uProjectionLoc = gl.getUniformLocation(program, "uProjection");
  gl.uniformMatrix4fv(uProjectionLoc, false, flatten(projection));

  // Set the normal transformation matrix as a mat3 Identity matrix and send it to the GPU
  let normalTransformation = mat3();
  let vNormalTransformation = gl.getUniformLocation(program, "vNormalTransformation");
  gl.uniformMatrix3fv(vNormalTransformation, false, flatten(normalTransformation));

  // Set the lightposition as a vec3 at the origin and send it to the GPU

  sign = new Sign(gl, program);
  carousel = new Carousel(gl, program);
  wheel = new Wheel(gl, program);

  render();
};

let time = 0;
var shine;

function render() {
  // Setup a ui.

  // #region Camera
  // Create viewXform using lookAt( eye, eye+at, up ) and push it to the GPU
  viewXform = lookAt(lookEYE, add(lookEYE, lookAT), lookUP);
  viewXform = mult(cameraXform, viewXform); // Modify the camera view model matrix as we move around with user input
  let uViewXform = gl.getUniformLocation(program, "uViewXform");
  gl.uniformMatrix4fv(uViewXform, false, flatten(viewXform));
  //#endregion

  // Grab our uniforms
  let uModelXformLoc = gl.getUniformLocation(program, "uModelXform");
  let uLightPositionLoc = gl.getUniformLocation(program, "uLightPosition");
  let uNormalMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

  let lightXform = mat4();
  lightXform = mult(translate(7.0, 3.5, 6.0), scalem(0.25, 0.25, 0.25));
  var lightPosition = vec3(mult(lightXform, vec4(0.0, 0.0, 0.0, 1)));

  gl.uniform3fv(uLightPositionLoc, flatten(lightPosition));

  gl.uniformMatrix4fv(uModelXformLoc, false, flatten(lightXform));

  gl.uniformMatrix4fv(uModelXformLoc, false, flatten(lightXform));

  gl.uniformMatrix3fv(uNormalMatrixLoc, false, flatten(calcNormalMatrix(viewXform, lightXform)));

  time += 1;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  sign.render(); // render the sign
  wheel.render(time, [25, 6, 12]); // Redraw the Ferris Wheel
  carousel.render(time, [8, -2, 15]); // Redraw the
  // set the shininess in the shader
  let uShininessLoc = gl.getUniformLocation(program, "uShininess");
  gl.uniform1f(uShininessLoc, shine);

  requestAnimFrame(render); // Continously loop through this render function
}
function updateShininess(event, ui) {
  console.log(ui.value);
  let shininess = ui.value;
  sine = shininess;
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
    case "A":
      var newXform = mat4();
      newXform = rotateY(-0.02);
      cameraXform = mult(newXform, cameraXform);
      var direction = vec3(Math.cos(radians(-2)), 0, Math.sin(radians(-2)));
      lookAT = add(direction, lookAT);
      break;
    case "s":
    case "S":
      lookEYE = subtract(lookEYE, mult(vec3(0.1, 0, 0.1), lookAT));
      break;
    case "d":
    case "D":
      var newXform = mat4();
      newXform = rotateY(0.02);
      cameraXform = mult(newXform, cameraXform);
      var direction = vec3(Math.cos(radians(2)), 0, Math.sin(radians(2)));
      lookAT = subtract(lookAT, direction);
      break;
    case "w":
    case "W":
      lookEYE = add(lookEYE, mult(vec3(0.1, 0, 0.1), lookAT));
      break;
  }
}

function configureWebGl() {
  document.addEventListener("keydown", moveCamera, false);
  let canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);

  !gl ? alert("WebGL isn't available") : null;

  gl.viewport(0, 0, canvas.width, canvas.height);
  aspectRatio = canvas.width / canvas.height;
  gl.clearColor(0.2, 0.6, 0.8, 1.0);

  // Load the shaders, create a GLSL program, and use it.
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
}

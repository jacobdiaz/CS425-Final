class Ground {
  constructor(gl, program) {
    this.program = program;
    this.gl = gl;

    this.baseDepthXTransform = mult(translate(0, -0.4, 0), scalem(100, 0.5, 100));
    this.baseXTransform = mult(translate(0, 0.1, 0), scalem(5, 0.2, 5));

    this.center = new Cylinder(25, gl, program, vec3(0.3, 1, 0.5), 1.0);
  }

  render(position) {
    let ground_translation = mat4();

    ground_translation = translate(position[0], position[1], position[2]);

    let uModelXform = gl.getUniformLocation(program, "uModelXform");
    let bdtransformation = mult(ground_translation, this.baseDepthXTransform);
    gl.uniformMatrix4fv(uModelXform, false, flatten(bdtransformation));

    this.center.render();
  }
}

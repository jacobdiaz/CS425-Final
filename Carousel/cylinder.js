class Cylinder {
  constructor(nSectors, gl, program, color) {
    this.nSectors = nSectors;
    this.gl = gl;
    this.program = program;

    var points = [];
    var colors = [];
    var normals = []; 
    var indices = [];
    var texCoords = []; // Vertex texture coordinate data
    var texindex = []; // Texture Index for which texture to map or not

    // Populate the colors arr
    for (var i = 0; i < 2 * (2 * nSectors + 2); i++) {
      colors.push(vec3(color));
    }

    var dTheta = radians(360 / nSectors);
    var halfPts = 2 * nSectors + 2;

    // The sides of the cylinder
    for (i = 0; i < nSectors + 1; i++) {
      var theta = i * dTheta;

      var normal = vec3(Math.cos(theta), 0, Math.sin(theta));
      normal = normalize(normal);
      texCoords.push(vec2(i / nSectors, 0.0));

      points.push(vec3(Math.cos(theta), 0, Math.sin(theta)));
      normals.push(normal);

      points.push(vec3(Math.cos(theta), 1, Math.sin(theta)));
      normals.push(normal);
      texCoords.push(vec2(i / nSectors, 1.0));

      indices.push(halfPts + 2 * i); 
      texindex.push(0.0);
      texindex.push(0.0);
    }

    for (i = 0; i < nSectors + 1; i++) {
      var theta = i * dTheta;

      points.push(vec3(Math.cos(theta), 0, Math.sin(theta)));
      normals.push(vec3(0, -1, 0));
      texCoords.push(vec2(i / nSectors, 0.0));

      points.push(vec3(Math.cos(theta), 1, Math.sin(theta)));
      normals.push(vec3(0, 1, 0));
      texCoords.push(vec2(i / nSectors, 1.0));

      indices.push(halfPts + 2 * i + 1);
      texindex.push(0.0);
      texindex.push(0.0);
    }

    // Push Vertex Location Data to GPU
    this.vbufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Push Color Data to GPU
    this.cbufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cbufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Push Normal Data to GPU
    this.nbufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    // Push Index Data to GPU
    this.ibufferID = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibufferID);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Push Texel Data to GPU
    this.tbufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tbufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    // Push Texture Index Data to GPU
    this.tibufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tibufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texindex), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return;
  }

  render() {
    var gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbufferID);
    var vPosition = gl.getAttribLocation(this.program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Connect the color data to the program shader variables
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cbufferID);
    var vColor = gl.getAttribLocation(this.program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbufferID);
    var vNormal = gl.getAttribLocation(this.program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibufferID);

    // Connect the texel data to the program shader variables
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tbufferID);
    var vTexCoords = gl.getAttribLocation(this.program, "vTexCoords");
    gl.vertexAttribPointer(vTexCoords, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoords);

    // Connect the texture index data to the program shader variables
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tibufferID);
    var vTexIndex = gl.getAttribLocation(this.program, "vTexIndex");
    gl.vertexAttribPointer(vTexIndex, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexIndex);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Draw the cylinder
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2 * this.nSectors + 2); // Sides
    gl.drawElements(gl.TRIANGLE_FAN, this.nSectors + 1, gl.UNSIGNED_BYTE, this.nSectors + 1); // Top
    gl.drawElements(gl.TRIANGLE_FAN, this.nSectors + 1, gl.UNSIGNED_BYTE, 0); // Bottom

    return;
  }
}

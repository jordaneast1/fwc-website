varying vec2 vUv;
uniform float uBlend;

void main()
{
    vUv = uv;
    //gl_Position = mix(vec4(vUv,1.0, 1.0), projectionMatrix * modelViewMatrix * vec4(position, 1.0), uBlend);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
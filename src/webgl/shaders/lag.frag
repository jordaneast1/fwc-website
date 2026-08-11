#define LAG 0.1
#define LAG_INVERSE 0.9

uniform sampler2D uDiffuse;
uniform sampler2D uLagTex;
uniform float uBlend;
varying vec2 vUv;

void main()
{
    vec4 Diffuse = texture2D(uDiffuse, vUv);
    vec4 LagTex = texture2D(uLagTex, vUv);

    vec4 Combined = (Diffuse * LAG_INVERSE) + (LagTex * LAG);
    gl_FragColor = mix(Diffuse,Combined, 1.0);
}
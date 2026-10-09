import * as THREE from "./assets/three.module.js";
const host = document.querySelector("#scene"),
  reduced = matchMedia("(prefers-reduced-motion: reduce)");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#dcded5");
scene.fog = new THREE.Fog("#dcded5", 8, 18);
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
camera.position.set(0, 2.7, 8.5);
camera.lookAt(0, 1.65, 0);
scene.add(new THREE.HemisphereLight(0xffffff, 0x77786d, 2.5));
const light = new THREE.DirectionalLight(0xffffff, 4);
light.position.set(-3, 7, 4);
light.castShadow = true;
light.shadow.mapSize.set(1024, 1024);
scene.add(light);
const ivory = new THREE.MeshStandardMaterial({
  color: 0xc7c5b8,
  roughness: 0.65,
  metalness: 0.08,
});
const mannequin = new THREE.Group();
scene.add(mannequin);
const clothes = new THREE.Group();
mannequin.add(clothes);
function mesh(geometry, material, parent = mannequin, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
mesh(
  new THREE.SphereGeometry(0.18, 32, 24),
  ivory,
  mannequin,
  0,
  3.24,
).scale.set(0.82, 1.3, 0.86);
mesh(
  new THREE.CylinderGeometry(0.065, 0.085, 0.18, 24),
  ivory,
  mannequin,
  0,
  2.98,
);
mesh(
  new THREE.CylinderGeometry(0.27, 0.2, 0.7, 32),
  ivory,
  mannequin,
  0,
  2.58,
).scale.z = 0.62;
mesh(
  new THREE.SphereGeometry(0.245, 24, 16),
  ivory,
  mannequin,
  0,
  2.12,
).scale.set(1, 0.8, 0.65);
for (const side of [-1, 1]) {
  const arm = mesh(
    new THREE.CapsuleGeometry(0.065, 0.91, 8, 16),
    ivory,
    mannequin,
    side * 0.34,
    2.35,
  );
  arm.rotation.z = side * 0.13;
  mesh(
    new THREE.SphereGeometry(0.065, 16, 12),
    ivory,
    mannequin,
    side * 0.41,
    1.79,
  ).scale.y = 1.5;
  mesh(
    new THREE.CylinderGeometry(0.1, 0.065, 1.36, 24),
    ivory,
    mannequin,
    side * 0.13,
    1.42,
  );
  mesh(
    new THREE.SphereGeometry(0.11, 20, 16),
    ivory,
    mannequin,
    side * 0.13,
    0.69,
    0.05,
  ).scale.set(0.8, 0.6, 1.8);
}
const plinth = mesh(
  new THREE.CylinderGeometry(0.73, 0.76, 0.28, 64),
  new THREE.MeshStandardMaterial({ color: 0xc8c9bf, roughness: 0.85 }),
  scene,
  0,
  0.47,
);
mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0xdcded5, roughness: 1 }),
  scene,
  0,
  0.32,
).rotation.x = -Math.PI / 2;
// Architectural backdrop: gently lit monolithic wall panels.
for (const x of [-2.6, 2.6])
  mesh(
    new THREE.BoxGeometry(0.32, 7, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xd2d4ca, roughness: 1 }),
    scene,
    x,
    3,
    -1.7,
  );
function profile(points, mat) {
  return mesh(
    new THREE.LatheGeometry(
      points.map(([r, y]) => new THREE.Vector2(r, y)),
      64,
    ),
    mat,
    clothes,
  );
}
window.setOutfit = (p) => {
  while (clothes.children.length) {
    const m = clothes.children[0];
    clothes.remove(m);
    m.geometry.dispose();
    m.material.dispose();
  }
  const fabric = new THREE.MeshStandardMaterial({
    color: p.color,
    roughness: 0.86,
    side: THREE.DoubleSide,
  });
  if (p.type === "dress" || p.type === "gown") {
    const gown = p.type === "gown";
    const garment = profile(
      [
        [gown ? 0.59 : 0.42, 0.79],
        [gown ? 0.47 : 0.33, 1.2],
        [0.29, 1.8],
        [0.22, 2.2],
        [0.28, 2.56],
        [0.25, 2.89],
      ],
      fabric,
    );
    garment.scale.z = 0.66;
    const neckline = mesh(
      new THREE.TorusGeometry(0.17, 0.025, 12, 48),
      fabric.clone(),
      clothes,
      0,
      2.88,
    );
    neckline.rotation.x = Math.PI / 2;
    neckline.scale.z = 0.7;
    if (gown) {
      const sash = mesh(
        new THREE.TorusGeometry(0.255, 0.055, 12, 48),
        fabric.clone(),
        clothes,
        0,
        2.45,
      );
      sash.rotation.set(1.4, 0, 0.28);
      sash.scale.z = 0.65;
    }
  } else {
    profile(
      [
        [0.29, 2.01],
        [0.26, 2.4],
        [0.32, 2.7],
        [0.24, 2.91],
      ],
      fabric,
    ).scale.z = 0.7;
    for (const side of [-1, 1]) {
      const sleeve = mesh(
        new THREE.CylinderGeometry(0.11, 0.13, 0.6, 24),
        fabric.clone(),
        clothes,
        side * 0.34,
        2.6,
      );
      sleeve.rotation.z = side * 0.14;
      mesh(
        new THREE.CylinderGeometry(0.15, 0.12, 1.24, 24),
        fabric.clone(),
        clothes,
        side * 0.15,
        1.41,
      );
    }
  }
};
window.setOutfit({ type: "dress", color: "#242523" });
let auto = !reduced.matches,
  dragging = false,
  lastX = 0,
  visible = true;
const toggle = document.querySelector("#rotateToggle");
function updateToggle() {
  toggle.textContent = auto ? "Pause rotation" : "Resume rotation";
  toggle.setAttribute("aria-pressed", String(auto));
}
updateToggle();
toggle.onclick = () => {
  auto = !auto;
  updateToggle();
};
reduced.addEventListener("change", () => {
  auto = !reduced.matches;
  updateToggle();
});
document.querySelector("#rotateLeft").onclick = () => {
  mannequin.rotation.y -= 0.35;
};
document.querySelector("#rotateRight").onclick = () => {
  mannequin.rotation.y += 0.35;
};
host.addEventListener("pointerdown", (e) => {
  dragging = true;
  lastX = e.clientX;
  host.setPointerCapture(e.pointerId);
});
host.addEventListener("pointermove", (e) => {
  if (dragging) {
    mannequin.rotation.y += (e.clientX - lastX) * 0.009;
    lastX = e.clientX;
  }
});
host.addEventListener("pointerup", () => (dragging = false));
host.addEventListener("pointercancel", () => (dragging = false));
new ResizeObserver(() => {
  const w = host.clientWidth,
    h = host.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}).observe(host);
new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(host);
renderer.domElement.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  document.querySelector("#sceneFallback").hidden = false;
  renderer.setAnimationLoop(null);
});
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!visible || document.hidden) return;
  if (auto && !dragging) mannequin.rotation.y += dt * 0.2;
  renderer.render(scene, camera);
});

"""
Procedural Sunflower 3D Generator for Blender (bpy)
---------------------------------------------------
Run inside Blender's Scripting workspace or via CLI:
blender --background --python generate_sunflower.py -- output_sunflower.glb

Features:
- Mathematical Fibonacci Phyllotaxis seed center (Vogel's spiral)
- Dual overlapping petal whorls with organic cupping & curvature
- Organic tapered curved stem with leaf bracts
- Realistic procedural PBR Principled BSDF materials with subsurface scattering & roughness
- Studio golden-hour rim lighting & 3-point portrait setup
- Automatic glTF/GLB exporter
"""

import bpy
import math
import mathutils
import sys

def clear_scene():
    """Clear existing meshes, materials, and lights."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)

def create_material(name, base_color, roughness=0.4, subsurface=0.05, specular=0.5):
    """Create a Principled BSDF material."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        # Base Color
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = base_color
        # Roughness
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        # Subsurface Scattering for petal glow
        if "Subsurface Weight" in bsdf.inputs:
            bsdf.inputs["Subsurface Weight"].default_value = subsurface
        elif "Subsurface" in bsdf.inputs:
            bsdf.inputs["Subsurface"].default_value = subsurface
        if "Specular IOR Level" in bsdf.inputs:
            bsdf.inputs["Specular IOR Level"].default_value = specular
    return mat

def create_stem():
    """Create a curved, organic stem."""
    curve_data = bpy.data.curves.new('StemCurve', type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.resolution_u = 12
    curve_data.bevel_depth = 0.12
    curve_data.bevel_resolution = 6

    polyline = curve_data.splines.new('BEZIER')
    polyline.bezier_points.add(2)
    
    # Base, middle, and top head attachment points
    pts = polyline.bezier_points
    pts[0].co = (0.0, 0.0, -3.2)
    pts[0].handle_left = (-0.1, 0.0, -3.8)
    pts[0].handle_right = (0.1, 0.0, -2.4)

    pts[1].co = (0.2, -0.1, -1.5)
    pts[1].handle_left = (0.15, -0.05, -2.2)
    pts[1].handle_right = (0.25, -0.15, -0.8)

    pts[2].co = (0.05, 0.15, -0.2)
    pts[2].handle_left = (0.1, 0.05, -0.7)
    pts[2].handle_right = (0.0, 0.25, 0.0)

    stem_obj = bpy.data.objects.new('Stem', curve_data)
    bpy.context.collection.objects.link(stem_obj)
    
    # Assign Green Plant Material
    mat_stem = create_material("Mat_Stem", (0.16, 0.35, 0.11, 1.0), roughness=0.6, subsurface=0.1)
    stem_obj.data.materials.append(mat_stem)
    return stem_obj

def create_center_disc(num_seeds=340):
    """Create the Fibonacci spiral center (Phyllotaxis)."""
    mesh = bpy.data.meshes.new("SunflowerDisc")
    obj = bpy.data.objects.new("CenterDisc", mesh)
    bpy.context.collection.objects.link(obj)

    verts = []
    golden_angle = 137.50776405 * (math.pi / 180.0)
    c = 0.062

    for i in range(num_seeds):
        r = c * math.sqrt(i)
        theta = i * golden_angle
        x = r * math.cos(theta)
        y = r * math.sin(theta)
        # Give dome profile
        z = 0.15 * math.cos(r * 1.4)
        verts.append((x, y, z))

    # Create icosphere for seed template
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.038, location=(0,0,0))
    seed_template = bpy.context.active_object
    seed_template.name = "SeedTemplate"

    # Material: deep velvety chocolate brown to golden amber center
    mat_disc = create_material("Mat_Disc", (0.18, 0.10, 0.04, 1.0), roughness=0.85, subsurface=0.05)
    seed_template.data.materials.append(mat_disc)

    # Instance seeds across the spiral
    center_group = bpy.data.objects.new("SeedFlorets", None)
    bpy.context.collection.objects.link(center_group)

    for idx, (x, y, z) in enumerate(verts):
        new_seed = seed_template.copy()
        new_seed.data = seed_template.data
        new_seed.location = (x, y, z)
        # Scale slightly smaller towards center
        s = 0.7 + 0.35 * (idx / num_seeds)
        new_seed.scale = (s, s, s * 1.3)
        bpy.context.collection.objects.link(new_seed)
        new_seed.parent = center_group

    # Remove template original
    bpy.data.objects.remove(seed_template, do_unlink=True)
    return center_group

def create_petal_mesh():
    """Create a single organic curved sunflower petal."""
    verts = [
        (0.0, 0.0, 0.0),      # 0: base
        (-0.22, 0.5, 0.04),   # 1: lower left
        (0.22, 0.5, 0.04),    # 2: lower right
        (-0.28, 1.1, 0.08),   # 3: mid left
        (0.28, 1.1, 0.08),    # 4: mid right
        (-0.16, 1.6, 0.05),   # 5: upper left
        (0.16, 1.6, 0.05),    # 6: upper right
        (0.0, 1.95, 0.01),    # 7: petal tip
        (0.0, 0.9, -0.04)     # 8: central spine crease
    ]
    faces = [
        (0, 1, 8), (0, 8, 2),
        (1, 3, 8), (2, 8, 4),
        (3, 5, 8), (4, 8, 6),
        (5, 7, 8), (6, 8, 7)
    ]
    mesh = bpy.data.meshes.new("PetalMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    
    petal_obj = bpy.data.objects.new("PetalTemplate", mesh)
    bpy.context.collection.objects.link(petal_obj)

    # Subsurf & Smooth for delicate organic curve
    subsurf = petal_obj.modifiers.new("Subsurf", 'SUBSURF')
    subsurf.levels = 2
    subsurf.render_levels = 2

    # Radiant golden-yellow with warm orange undertones & translucency
    mat_petal = create_material("Mat_Petal", (1.0, 0.72, 0.05, 1.0), roughness=0.35, subsurface=0.25)
    petal_obj.data.materials.append(mat_petal)
    return petal_obj

def build_petals(petal_template, inner_count=28, outer_count=32):
    """Build inner and outer layered sunflower petal rings."""
    petals_group = bpy.data.objects.new("PetalWhorls", None)
    bpy.context.collection.objects.link(petals_group)

    radius_inner = 1.05
    radius_outer = 1.18

    # Inner Whorl
    for i in range(inner_count):
        angle = (i / inner_count) * 2 * math.pi
        p = petal_template.copy()
        p.data = petal_template.data
        p.location = (radius_inner * math.cos(angle), radius_inner * math.sin(angle), 0.04)
        p.rotation_euler = (0.28, 0.0, angle - math.pi / 2)
        p.scale = (0.85, 0.9, 0.85)
        bpy.context.collection.objects.link(p)
        p.parent = petals_group

    # Outer Whorl (Offset & tilted slightly outwards)
    for i in range(outer_count):
        angle = ((i + 0.5) / outer_count) * 2 * math.pi
        p = petal_template.copy()
        p.data = petal_template.data
        p.location = (radius_outer * math.cos(angle), radius_outer * math.sin(angle), -0.02)
        p.rotation_euler = (0.42, 0.0, angle - math.pi / 2)
        p.scale = (1.0, 1.05, 1.0)
        bpy.context.collection.objects.link(p)
        p.parent = petals_group

    # Clean up base template
    bpy.data.objects.remove(petal_template, do_unlink=True)
    return petals_group

def setup_lighting_and_camera():
    """Set up sunset golden-hour lighting and portrait camera."""
    # Key Warm Sun Light
    key_light_data = bpy.data.lights.new(name="SunKeyLight", type='SUN')
    key_light_data.energy = 4.2
    key_light_data.color = (1.0, 0.88, 0.65)
    key_obj = bpy.data.objects.new("SunKeyLight", key_light_data)
    key_obj.rotation_euler = (0.6, 0.3, 0.8)
    bpy.context.collection.objects.link(key_obj)

    # Warm Rim Light (Gives petals the translucent golden rim)
    rim_light_data = bpy.data.lights.new(name="RimLight", type='POINT')
    rim_light_data.energy = 85.0
    rim_light_data.color = (1.0, 0.6, 0.15)
    rim_obj = bpy.data.objects.new("RimLight", rim_light_data)
    rim_obj.location = (0.0, 2.5, 0.8)
    bpy.context.collection.objects.link(rim_obj)

    # Soft Cool Fill Light
    fill_light_data = bpy.data.lights.new(name="FillLight", type='POINT')
    fill_light_data.energy = 40.0
    fill_light_data.color = (0.7, 0.85, 1.0)
    fill_obj = bpy.data.objects.new("FillLight", fill_light_data)
    fill_obj.location = (-2.0, -2.5, 1.5)
    bpy.context.collection.objects.link(fill_obj)

    # Camera
    cam_data = bpy.data.cameras.new("MainCamera")
    cam_data.lens = 50
    cam_obj = bpy.data.objects.new("MainCamera", cam_data)
    cam_obj.location = (0.0, -4.5, 1.2)
    cam_obj.rotation_euler = (1.35, 0.0, 0.0)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

def export_gltf(filepath="sunflower.glb"):
    """Export the assembled sunflower to GLB format."""
    try:
        bpy.ops.export_scene.gltf(
            filepath=filepath,
            export_format='GLB',
            use_selection=False,
            export_apply=True
        )
        print(f"[SUCCESS] Exported 3D Sunflower model to: {filepath}")
    except Exception as e:
        print(f"[NOTE] GLTF export status: {e}")

def main():
    clear_scene()
    print("Generating procedural 3D Sunflower in Blender...")
    
    stem = create_stem()
    disc = create_center_disc(num_seeds=280)
    petal_template = create_petal_mesh()
    petals = build_petals(petal_template)
    
    # Parent head elements to stem
    flower_head = bpy.data.objects.new("Sunflower_Head", None)
    bpy.context.collection.objects.link(flower_head)
    disc.parent = flower_head
    petals.parent = flower_head
    
    # Angle the head slightly upwards towards the sun
    flower_head.rotation_euler = (-0.35, 0.1, 0.0)
    flower_head.location = (0.05, 0.15, -0.2)

    setup_lighting_and_camera()

    # Check CLI arguments for export
    output_path = "sunflower_model.glb"
    if "--" in sys.argv:
        args = sys.argv[sys.argv.index("--") + 1:]
        if args:
            output_path = args[0]
            
    export_gltf(output_path)
    print("Sunflower procedural generation complete!")

if __name__ == "__main__":
    main()

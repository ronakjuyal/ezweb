import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/component_registry.dart';
import '../../services/api_service.dart';

class ComponentFormBuilder extends StatefulWidget {
  final int websiteId;
  final ComponentRegistry component;
  final String? initialSchemaData;
  final int? initialPosition;
  final VoidCallback onCancel;
  final Function(String schemaData, int position) onSubmit;

  const ComponentFormBuilder({
    super.key,
    required this.websiteId,
    required this.component,
    this.initialSchemaData,
    this.initialPosition,
    required this.onCancel,
    required this.onSubmit,
  });

  @override
  State<ComponentFormBuilder> createState() => _ComponentFormBuilderState();
}

class _ComponentFormBuilderState extends State<ComponentFormBuilder> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _formData = {};
  final Map<String, TextEditingController> _controllers = {};
  final ApiService _apiService = ApiService();
  bool _isUploading = false;
  int _position = 0;
  bool _showAdvanced = false;

  @override
  void initState() {
    super.initState();
    _apiService.init();
    // For new components (no initialPosition), position will be set automatically to last
    // For edit mode, use the existing position
    _position = widget.initialPosition ?? 999; // Will be updated to actual last position on submit
    _initializeFormData();
  }

  void _initializeFormData() {
    final schema = _parseSchema(widget.component.schema);

    if (widget.initialSchemaData != null) {
      // Edit mode - load existing data
      final existingData = jsonDecode(widget.initialSchemaData!);
      _formData.addAll(existingData);
    } else {
      // Add mode - use defaults
      schema.forEach((key, value) {
        if (value is Map && value.containsKey('default')) {
          _formData[key] = value['default'];
        }
      });
    }

    // Initialize controllers for text fields
    schema.forEach((key, value) {
      if (value is Map && (value['type'] == 'text' || value['type'] == 'url')) {
        _controllers[key] = TextEditingController(
          text: _formData[key]?.toString() ?? '',
        );
      }
    });
  }

  Map<String, dynamic> _parseSchema(String schemaString) {
    try {
      var decoded = jsonDecode(schemaString);

      // If decoded is a Map and has a 'schema' key, use that
      if (decoded is Map<String, dynamic> && decoded.containsKey('schema')) {
        return decoded['schema'] as Map<String, dynamic>;
      }

      // If decoded is already a Map without 'schema' key, return it
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }

      // If it's a string (double-encoded), decode again
      if (decoded is String) {
        return jsonDecode(decoded) as Map<String, dynamic>;
      }

      throw Exception('Invalid schema format');
    } catch (e) {
      // Error parsing schema - rethrow with context
      throw Exception('Error parsing schema: $e\nSchema string: $schemaString');
    }
  }

  @override
  void dispose() {
    _controllers.forEach((_, controller) => controller.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final schema = _parseSchema(widget.component.schema);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Component header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.widgets, size: 40, color: Colors.blue[700]),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.component.name,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (widget.component.description != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              widget.component.description!,
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Component Properties',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Dynamic form fields based on schema
            ...schema.entries.where((entry) {
              final field = entry.value as Map<String, dynamic>;
              return field['type'] != 'advanced';
            }).map((entry) {
              final key = entry.key;
              final field = entry.value as Map<String, dynamic>;
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _buildFieldWidget(key, field),
              );
            }),

            // Advanced section (if exists)
            if (schema.entries.any((e) => (e.value as Map)['type'] == 'advanced')) ...[
              const SizedBox(height: 8),
              Card(
                child: ExpansionTile(
                  title: const Text(
                    'Advanced Settings',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  leading: const Icon(Icons.settings_outlined),
                  initiallyExpanded: _showAdvanced,
                  onExpansionChanged: (expanded) {
                    setState(() => _showAdvanced = expanded);
                  },
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: schema.entries
                            .where((e) => (e.value as Map)['type'] == 'advanced')
                            .expand<Widget>((entry) {
                          final advancedSchema = (entry.value as Map)['schema'] as Map<String, dynamic>?;
                          if (advancedSchema == null) return <Widget>[];

                          return advancedSchema.entries.map<Widget>((advEntry) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: _buildFieldWidget(advEntry.key, advEntry.value as Map<String, dynamic>),
                            );
                          });
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isUploading ? null : widget.onCancel,
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isUploading ? null : _handleSubmit,
                    child: _isUploading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Save Component'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFieldWidget(String key, Map<String, dynamic> field) {
    final type = field['type'] as String;
    final label = field['label'] as String? ?? _formatLabel(key);
    final required = field['required'] as bool? ?? false;
    final editable = field['editable'] as bool? ?? true;

    if (!editable) {
      return const SizedBox.shrink();
    }

    switch (type) {
      case 'text':
        return TextFormField(
          controller: _controllers[key],
          decoration: InputDecoration(
            labelText: label,
            helperText: field['helperText'] as String?,
          ),
          maxLines: field['multiline'] == true ? 3 : 1,
          onChanged: (value) => _formData[key] = value,
          validator: required
              ? (value) => value?.isEmpty ?? true ? '$label is required' : null
              : null,
        );

      case 'url':
        return TextFormField(
          controller: _controllers[key],
          decoration: InputDecoration(
            labelText: label,
            helperText: 'Enter a valid URL',
            prefixIcon: const Icon(Icons.link),
          ),
          keyboardType: TextInputType.url,
          onChanged: (value) => _formData[key] = value,
          validator: (value) {
            if (required && (value?.isEmpty ?? true)) {
              return '$label is required';
            }
            if (value != null &&
                value.isNotEmpty &&
                !Uri.tryParse(value)!.hasScheme) {
              return 'Please enter a valid URL';
            }
            return null;
          },
        );

      case 'number':
        return TextFormField(
          initialValue: _formData[key]?.toString() ?? '',
          decoration: InputDecoration(labelText: label),
          keyboardType: TextInputType.number,
          onChanged: (value) {
            final num = double.tryParse(value);
            _formData[key] = num ?? 0;
          },
          validator: required
              ? (value) => value?.isEmpty ?? true ? '$label is required' : null
              : null,
        );

      case 'boolean':
        return SwitchListTile(
          title: Text(label),
          value: _formData[key] ?? field['default'] ?? false,
          onChanged: (value) {
            setState(() {
              _formData[key] = value;
            });
          },
        );

      case 'color':
        return _buildColorPicker(key, label, field);

      case 'image':
        return _buildImagePicker(key, label, field, required);

      case 'multi-images':
        return _buildMultiImagePicker(key, label, field, required);

      case 'select':
        return _buildSelectDropdown(key, label, field, required);

      case 'richtext':
        return TextFormField(
          controller: _controllers[key],
          decoration: InputDecoration(
            labelText: label,
            helperText: 'Rich text content',
          ),
          maxLines: 5,
          onChanged: (value) => _formData[key] = value,
          validator: required
              ? (value) => value?.isEmpty ?? true ? '$label is required' : null
              : null,
        );

      default:
        return TextFormField(
          initialValue: _formData[key]?.toString() ?? '',
          decoration: InputDecoration(labelText: label),
          onChanged: (value) => _formData[key] = value,
        );
    }
  }

  Widget _buildColorPicker(String key, String label, Map<String, dynamic> field) {
    Color currentColor = _parseColor(_formData[key] ?? field['default'] ?? '#000000');

    return InkWell(
      onTap: () async {
        Color? pickedColor;
        await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Pick $label'),
            content: SingleChildScrollView(
              child: ColorPicker(
                pickerColor: currentColor,
                onColorChanged: (color) {
                  pickedColor = color;
                },
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () {
                  if (pickedColor != null) {
                    setState(() {
                      _formData[key] = _colorToHex(pickedColor!);
                    });
                  }
                  Navigator.pop(context);
                },
                child: const Text('Select'),
              ),
            ],
          ),
        );
      },
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          suffixIcon: Container(
            width: 40,
            height: 40,
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: currentColor,
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
        child: Text(_formData[key] ?? field['default'] ?? '#000000'),
      ),
    );
  }

  Widget _buildImagePicker(
    String key,
    String label,
    Map<String, dynamic> field,
    bool required,
  ) {
    final currentImageUrl = _formData[key] as String?;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 8),
        if (currentImageUrl != null && currentImageUrl.isNotEmpty) ...[
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  currentImageUrl,
                  height: 150,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 150,
                    color: Colors.grey[300],
                    child: const Icon(Icons.broken_image, size: 50),
                  ),
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  style: IconButton.styleFrom(backgroundColor: Colors.black54),
                  onPressed: () {
                    setState(() {
                      _formData[key] = null;
                    });
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
        ElevatedButton.icon(
          onPressed: () => _pickAndUploadImage(key),
          icon: const Icon(Icons.upload),
          label: Text(currentImageUrl == null ? 'Upload Image' : 'Change Image'),
        ),
        if (required && (currentImageUrl == null || currentImageUrl.isEmpty))
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              '$label is required',
              style: const TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),
      ],
    );
  }

  Widget _buildSelectDropdown(
    String key,
    String label,
    Map<String, dynamic> field,
    bool required,
  ) {
    final List<dynamic> options = field['options'] as List<dynamic>? ?? [];
    final String currentValue = _formData[key]?.toString() ?? field['default']?.toString() ?? (options.isNotEmpty ? options[0].toString() : '');

    // Initialize if not set
    if (_formData[key] == null && currentValue.isNotEmpty) {
      _formData[key] = currentValue;
    }

    return DropdownButtonFormField<String>(
      value: currentValue.isEmpty ? null : currentValue,
      decoration: InputDecoration(
        labelText: label,
        helperText: field['description'] as String?,
      ),
      items: options.map<DropdownMenuItem<String>>((dynamic value) {
        return DropdownMenuItem<String>(
          value: value.toString(),
          child: Text(value.toString()),
        );
      }).toList(),
      onChanged: (String? newValue) {
        setState(() {
          _formData[key] = newValue;
        });
      },
      validator: required
          ? (value) => value == null || value.isEmpty ? '$label is required' : null
          : null,
    );
  }

  Widget _buildMultiImagePicker(
    String key,
    String label,
    Map<String, dynamic> field,
    bool required,
  ) {
    final currentImages = _formData[key] as List<dynamic>? ?? [];
    final maxImages = field['maxImages'] as int? ?? 10;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            Text(
              '${currentImages.length}/$maxImages',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Image grid
        if (currentImages.isNotEmpty) ...[
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: currentImages.length,
            itemBuilder: (context, index) {
              final imageUrl = currentImages[index] as String;
              return Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      imageUrl,
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: Colors.grey[300],
                        child: const Icon(Icons.broken_image, size: 30),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          final updatedImages = List.from(currentImages);
                          updatedImages.removeAt(index);
                          _formData[key] = updatedImages;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.black54,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 12),
        ],

        // Upload button
        ElevatedButton.icon(
          onPressed: currentImages.length >= maxImages
              ? null
              : () => _pickAndUploadMultiImage(key),
          icon: const Icon(Icons.add_photo_alternate),
          label: Text(
            currentImages.isEmpty ? 'Upload Images' : 'Add More Images',
          ),
        ),

        if (field['description'] != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              field['description'] as String,
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ),

        if (required && currentImages.isEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              '$label is required (at least 1 image)',
              style: const TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),
      ],
    );
  }

  Future<void> _pickAndUploadImage(String key) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1920,
      maxHeight: 1080,
      imageQuality: 85,
    );

    if (image != null) {
      setState(() => _isUploading = true);

      try {
        final bytes = await image.readAsBytes();
        final fileName = image.name;

        final imageUrl = await _apiService.uploadMedia(
          bytes,
          fileName,
          'image/jpeg',
          'components',
        );

        setState(() {
          _formData[key] = imageUrl;
          _isUploading = false;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Image uploaded successfully'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        setState(() => _isUploading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Upload failed: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _pickAndUploadMultiImage(String key) async {
    final ImagePicker picker = ImagePicker();
    final List<XFile> images = await picker.pickMultiImage(
      maxWidth: 1920,
      maxHeight: 1080,
      imageQuality: 85,
    );

    if (images.isNotEmpty) {
      setState(() => _isUploading = true);

      try {
        final currentImages = _formData[key] as List<dynamic>? ?? [];
        final uploadedUrls = <String>[];

        for (final image in images) {
          final bytes = await image.readAsBytes();
          final fileName = image.name;

          final imageUrl = await _apiService.uploadMedia(
            bytes,
            fileName,
            'image/jpeg',
            'components',
          );

          uploadedUrls.add(imageUrl);
        }

        setState(() {
          _formData[key] = [...currentImages, ...uploadedUrls];
          _isUploading = false;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${uploadedUrls.length} image(s) uploaded successfully'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        setState(() => _isUploading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Upload failed: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  void _handleSubmit() {
    if (_formKey.currentState?.validate() ?? false) {
      // Check for required images
      final schema = _parseSchema(widget.component.schema);
      bool hasRequiredImageMissing = false;

      schema.forEach((key, value) {
        if (value is Map && (value['required'] ?? false)) {
          // Check required single images
          if (value['type'] == 'image') {
            if (_formData[key] == null || (_formData[key] as String).isEmpty) {
              hasRequiredImageMissing = true;
            }
          }
          // Check required multi-images
          if (value['type'] == 'multi-images') {
            final images = _formData[key] as List<dynamic>?;
            if (images == null || images.isEmpty) {
              hasRequiredImageMissing = true;
            }
          }
        }
      });

      if (hasRequiredImageMissing) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please upload all required images'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      final schemaData = jsonEncode(_formData);
      widget.onSubmit(schemaData, _position);
    }
  }

  String _formatLabel(String key) {
    return key
        .replaceAllMapped(
          RegExp(r'([A-Z])'),
          (match) => ' ${match.group(0)}',
        )
        .trim()
        .split(' ')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }

  Color _parseColor(String colorString) {
    try {
      final hexColor = colorString.replaceAll('#', '');
      return Color(int.parse('FF$hexColor', radix: 16));
    } catch (e) {
      return Colors.black;
    }
  }

  String _colorToHex(Color color) {
    // Use toARGB32 instead of deprecated .value property
    final argb = color.toARGB32();
    return '#${argb.toRadixString(16).substring(2)}';
  }
}

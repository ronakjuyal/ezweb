import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/product.dart';
import '../../models/category.dart';
import '../../models/sub_category.dart';
import '../../providers/product_provider.dart';
import '../../providers/category_provider.dart';
import '../../services/api_service.dart';

class ProductFormScreen extends StatefulWidget {
  final int websiteId;
  final Product? product;

  const ProductFormScreen({
    super.key,
    required this.websiteId,
    this.product,
  });

  @override
  State<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends State<ProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _stockController = TextEditingController();
  final ApiService _apiService = ApiService();

  bool _available = true;
  String? _imageUrl;
  List<String> _imageUrls = [];  // Multiple images
  bool _isUploading = false;
  int? _selectedCategoryId;
  int? _selectedSubCategoryId;
  List<SubCategory> _availableSubCategories = [];

  bool get _isEditMode => widget.product != null;

  @override
  void initState() {
    super.initState();
    _apiService.init();

    // Fetch categories
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<CategoryProvider>(context, listen: false)
          .fetchWebsiteCategories(widget.websiteId, activeOnly: true);
    });

    if (_isEditMode) {
      final product = widget.product!;
      _nameController.text = product.name;
      _descriptionController.text = product.description ?? '';
      _priceController.text = product.price.toString();
      _stockController.text = product.stock.toString();
      _available = product.available;
      _imageUrl = product.imageUrl;
      _imageUrls = product.imageUrls ?? [];
      // Category and sub-category will be set from product data when available
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _stockController.dispose();
    super.dispose();
  }

  Future<void> _pickAndUploadMultipleImages() async {
    if (_imageUrls.length >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Maximum 5 images allowed'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final ImagePicker picker = ImagePicker();
    final List<XFile> images = await picker.pickMultiImage(
      maxWidth: 1920,
      maxHeight: 1080,
      imageQuality: 85,
    );

    if (images.isNotEmpty) {
      final remainingSlots = 5 - _imageUrls.length;
      final imagesToUpload = images.take(remainingSlots).toList();

      setState(() => _isUploading = true);

      try {
        final uploadedUrls = <String>[];

        for (final image in imagesToUpload) {
          final bytes = await image.readAsBytes();
          final imageUrl = await _apiService.uploadMedia(
            bytes,
            image.name,
            'image/jpeg',
            'products',
          );
          uploadedUrls.add(imageUrl);
        }

        setState(() {
          _imageUrls.addAll(uploadedUrls);
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

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final data = {
      'name': _nameController.text.trim(),
      'description': _descriptionController.text.trim().isEmpty
          ? null
          : _descriptionController.text.trim(),
      'price': double.parse(_priceController.text),
      'imageUrl': _imageUrl,
      'imageUrls': _imageUrls,
      'stock': int.parse(_stockController.text),
      'available': _available,
      'categoryId': _selectedCategoryId,
      'subCategoryId': _selectedSubCategoryId,
    };

    final provider = Provider.of<ProductProvider>(context, listen: false);
    bool success;

    if (_isEditMode) {
      success = await provider.updateProduct(
        widget.websiteId,
        widget.product!.id,
        data,
      );
    } else {
      success = await provider.addProduct(widget.websiteId, data);
    }

    if (mounted) {
      if (success) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _isEditMode
                  ? 'Product updated successfully'
                  : 'Product added successfully',
            ),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              provider.errorMessage ??
                  (_isEditMode ? 'Failed to update product' : 'Failed to add product'),
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditMode ? 'Edit Product' : 'Add Product'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Product images section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Product Images',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                  ),
                  Text(
                    '${_imageUrls.length}/5',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Image grid
              if (_imageUrls.isNotEmpty) ...[
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: _imageUrls.length,
                  itemBuilder: (context, index) {
                    return Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            _imageUrls[index],
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
                                _imageUrls.removeAt(index);
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

              // Upload images button
              ElevatedButton.icon(
                onPressed: _imageUrls.length >= 5 || _isUploading
                    ? null
                    : _pickAndUploadMultipleImages,
                icon: _isUploading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.add_photo_alternate),
                label: Text(
                  _imageUrls.isEmpty ? 'Upload Product Images' : 'Add More Images',
                ),
              ),
              const SizedBox(height: 24),

              // Product name
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Product Name',
                  hintText: 'Enter product name',
                ),
                textCapitalization: TextCapitalization.words,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Product name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Description
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  hintText: 'Enter product description (optional)',
                ),
                maxLines: 3,
                textCapitalization: TextCapitalization.sentences,
              ),
              const SizedBox(height: 16),

              // Price
              TextFormField(
                controller: _priceController,
                decoration: const InputDecoration(
                  labelText: 'Price',
                  hintText: '0.00',
                  prefixText: '\$ ',
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Price is required';
                  }
                  final price = double.tryParse(value);
                  if (price == null) {
                    return 'Please enter a valid price';
                  }
                  if (price < 0) {
                    return 'Price cannot be negative';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Stock
              TextFormField(
                controller: _stockController,
                decoration: const InputDecoration(
                  labelText: 'Stock Quantity',
                  hintText: '0',
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Stock quantity is required';
                  }
                  final stock = int.tryParse(value);
                  if (stock == null) {
                    return 'Please enter a valid number';
                  }
                  if (stock < 0) {
                    return 'Stock cannot be negative';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Category dropdown
              Consumer<CategoryProvider>(
                builder: (context, categoryProvider, _) {
                  final categories = categoryProvider.categories;

                  return DropdownButtonFormField<int>(
                    value: _selectedCategoryId,
                    decoration: const InputDecoration(
                      labelText: 'Category (Optional)',
                      hintText: 'Select a category',
                    ),
                    items: [
                      const DropdownMenuItem<int>(
                        value: null,
                        child: Text('None'),
                      ),
                      ...categories.map((category) {
                        return DropdownMenuItem<int>(
                          value: category.id,
                          child: Text(category.name),
                        );
                      }).toList(),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _selectedCategoryId = value;
                        _selectedSubCategoryId = null;  // Reset sub-category

                        // Update available sub-categories
                        if (value != null) {
                          final selectedCategory = categories.firstWhere(
                            (c) => c.id == value,
                          );
                          _availableSubCategories = selectedCategory.subCategories ?? [];
                        } else {
                          _availableSubCategories = [];
                        }
                      });
                    },
                  );
                },
              ),
              const SizedBox(height: 16),

              // Sub-category dropdown (only shown if category is selected)
              if (_selectedCategoryId != null && _availableSubCategories.isNotEmpty) ...[
                DropdownButtonFormField<int>(
                  value: _selectedSubCategoryId,
                  decoration: const InputDecoration(
                    labelText: 'Sub-Category (Optional)',
                    hintText: 'Select a sub-category',
                  ),
                  items: [
                    const DropdownMenuItem<int>(
                      value: null,
                      child: Text('None'),
                    ),
                    ..._availableSubCategories.map((subCat) {
                      return DropdownMenuItem<int>(
                        value: subCat.id,
                        child: Text(subCat.name),
                      );
                    }).toList(),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedSubCategoryId = value;
                    });
                  },
                ),
                const SizedBox(height: 16),
              ],

              // Available switch
              SwitchListTile(
                title: const Text('Available for Purchase'),
                subtitle: Text(
                  _available
                      ? 'Product is visible and can be purchased'
                      : 'Product is hidden from customers',
                ),
                value: _available,
                onChanged: (value) {
                  setState(() {
                    _available = value;
                  });
                },
              ),
              const SizedBox(height: 32),

              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Consumer<ProductProvider>(
                      builder: (context, provider, _) {
                        return ElevatedButton(
                          onPressed: provider.isLoading ? null : _handleSubmit,
                          child: provider.isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : Text(_isEditMode ? 'Update' : 'Add Product'),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

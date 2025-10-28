import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/sub_category.dart';
import '../../providers/category_provider.dart';

class SubCategoryFormScreen extends StatefulWidget {
  final int websiteId;
  final int categoryId;
  final String categoryName;
  final SubCategory? subCategory;

  const SubCategoryFormScreen({
    super.key,
    required this.websiteId,
    required this.categoryId,
    required this.categoryName,
    this.subCategory,
  });

  @override
  State<SubCategoryFormScreen> createState() => _SubCategoryFormScreenState();
}

class _SubCategoryFormScreenState extends State<SubCategoryFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  bool _active = true;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.subCategory?.name ?? '');
    _descriptionController = TextEditingController(text: widget.subCategory?.description ?? '');
    _active = widget.subCategory?.active ?? true;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final provider = Provider.of<CategoryProvider>(context, listen: false);

    final subCategoryData = {
      'categoryId': widget.categoryId,
      'name': _nameController.text.trim(),
      'description': _descriptionController.text.trim().isEmpty
          ? null
          : _descriptionController.text.trim(),
      'active': _active,
    };

    bool success;
    if (widget.subCategory == null) {
      success = await provider.createSubCategory(widget.websiteId, subCategoryData);
    } else {
      success = await provider.updateSubCategory(
        widget.websiteId,
        widget.subCategory!.id!,
        subCategoryData,
      );
    }

    if (mounted) {
      setState(() => _isLoading = false);

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.subCategory == null
                  ? 'Sub-category created successfully'
                  : 'Sub-category updated successfully',
            ),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(provider.error ?? 'Failed to save sub-category'),
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
        title: Text(
          widget.subCategory == null ? 'Add Sub-Category' : 'Edit Sub-Category',
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Card(
                color: Colors.blue[50],
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      const Icon(Icons.category, color: Colors.blue),
                      const SizedBox(width: 8),
                      Text(
                        'Category: ${widget.categoryName}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Sub-Category Name',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.subdirectory_arrow_right),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a sub-category name';
                  }
                  if (value.trim().length > 100) {
                    return 'Sub-category name must be 100 characters or less';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description (Optional)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.description),
                ),
                maxLines: 3,
                maxLength: 500,
                validator: (value) {
                  if (value != null && value.trim().length > 500) {
                    return 'Description must be 500 characters or less';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              SwitchListTile(
                title: const Text('Active'),
                subtitle: const Text('Sub-category is visible and can be used'),
                value: _active,
                onChanged: (value) {
                  setState(() => _active = value);
                },
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isLoading ? null : _submitForm,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        widget.subCategory == null
                            ? 'Create Sub-Category'
                            : 'Update Sub-Category',
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

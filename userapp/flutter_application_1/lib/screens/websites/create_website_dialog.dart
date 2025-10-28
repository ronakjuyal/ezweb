import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/website_provider.dart';

class CreateWebsiteDialog extends StatefulWidget {
  const CreateWebsiteDialog({super.key});

  @override
  State<CreateWebsiteDialog> createState() => _CreateWebsiteDialogState();
}

class _CreateWebsiteDialogState extends State<CreateWebsiteDialog> {
  final _formKey = GlobalKey<FormState>();
  final _subdomainController = TextEditingController();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _published = false;

  @override
  void dispose() {
    _subdomainController.dispose();
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _handleCreate() async {
    if (_formKey.currentState!.validate()) {
      final websiteProvider = Provider.of<WebsiteProvider>(context, listen: false);

      final success = await websiteProvider.createWebsite(
        subdomain: _subdomainController.text.trim().toLowerCase(),
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
        published: _published,
      );

      if (success && mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Website created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              websiteProvider.errorMessage ?? 'Failed to create website',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Create New Website'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _subdomainController,
                decoration: const InputDecoration(
                  labelText: 'Subdomain',
                  hintText: 'mywebsite',
                  helperText: 'Your site will be at mywebsite.ezweb.com',
                  prefixIcon: Icon(Icons.link),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a subdomain';
                  }
                  if (value.length < 3) {
                    return 'Subdomain must be at least 3 characters';
                  }
                  if (!RegExp(r'^[a-z0-9-]+$').hasMatch(value)) {
                    return 'Only lowercase letters, numbers, and hyphens allowed';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Website Title',
                  hintText: 'My Awesome Website',
                  prefixIcon: Icon(Icons.title),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a title';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description (optional)',
                  hintText: 'Brief description of your website',
                  prefixIcon: Icon(Icons.description),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              SwitchListTile(
                title: const Text('Publish immediately'),
                subtitle: const Text('Make website publicly accessible'),
                value: _published,
                onChanged: (value) {
                  setState(() {
                    _published = value;
                  });
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        Consumer<WebsiteProvider>(
          builder: (context, websiteProvider, _) {
            return ElevatedButton(
              onPressed: websiteProvider.isLoading ? null : _handleCreate,
              child: websiteProvider.isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Create'),
            );
          },
        ),
      ],
    );
  }
}

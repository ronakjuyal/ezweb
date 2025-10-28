import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/component_provider.dart';
import '../../models/component_registry.dart';
import 'component_form_builder.dart';

class AddComponentScreen extends StatefulWidget {
  final int websiteId;

  const AddComponentScreen({super.key, required this.websiteId});

  @override
  State<AddComponentScreen> createState() => _AddComponentScreenState();
}

class _AddComponentScreenState extends State<AddComponentScreen> {
  ComponentRegistry? _selectedComponent;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ComponentProvider>(context, listen: false)
          .fetchAvailableComponents();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Component'),
      ),
      body: _selectedComponent == null
          ? _buildComponentSelector()
          : _buildComponentForm(),
    );
  }

  Widget _buildComponentSelector() {
    return Consumer<ComponentProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading && provider.availableComponents.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.availableComponents.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.inventory_2, size: 80, color: Colors.grey[400]),
                const SizedBox(height: 16),
                const Text(
                  'No components available',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Contact admin to add components',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ],
            ),
          );
        }

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text(
              'Select a component to add',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...provider.availableComponents.map((component) {
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.blue[100],
                    child: Icon(
                      _getIconForCategory(component.category),
                      color: Colors.blue[800],
                    ),
                  ),
                  title: Text(
                    component.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text('Category: ${component.category}'),
                      if (component.description != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          component.description!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ],
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    setState(() {
                      _selectedComponent = component;
                    });
                  },
                ),
              );
            }),
          ],
        );
      },
    );
  }

  Widget _buildComponentForm() {
    return ComponentFormBuilder(
      websiteId: widget.websiteId,
      component: _selectedComponent!,
      onCancel: () {
        setState(() {
          _selectedComponent = null;
        });
      },
      onSubmit: (schemaData, position) async {
        final provider = Provider.of<ComponentProvider>(context, listen: false);
        final success = await provider.addComponentToWebsite(
          widget.websiteId,
          _selectedComponent!.id,
          schemaData,
          position,
        );

        if (success && mounted) {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Component added successfully'),
              backgroundColor: Colors.green,
            ),
          );
        } else if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(provider.errorMessage ?? 'Failed to add component'),
              backgroundColor: Colors.red,
            ),
          );
        }
      },
    );
  }

  IconData _getIconForCategory(String? category) {
    if (category == null) return Icons.widgets;

    switch (category.toLowerCase()) {
      case 'hero':
        return Icons.photo_size_select_actual;
      case 'product':
        return Icons.shopping_bag;
      case 'contact':
        return Icons.contact_mail;
      case 'about':
        return Icons.info;
      case 'footer':
        return Icons.vertical_align_bottom;
      case 'header':
        return Icons.vertical_align_top;
      default:
        return Icons.widgets;
    }
  }
}

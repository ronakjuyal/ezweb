import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/website_component.dart';
import '../../providers/component_provider.dart';
import 'component_form_builder.dart';

class EditComponentScreen extends StatelessWidget {
  final int websiteId;
  final WebsiteComponent component;

  const EditComponentScreen({
    super.key,
    required this.websiteId,
    required this.component,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Component'),
        actions: [
          // Toggle visibility
          Consumer<ComponentProvider>(
            builder: (context, provider, _) {
              final currentComponent = provider.websiteComponents
                  .firstWhere((c) => c.id == component.id, orElse: () => component);

              return IconButton(
                icon: Icon(
                  currentComponent.visible
                      ? Icons.visibility
                      : Icons.visibility_off,
                ),
                tooltip: currentComponent.visible ? 'Hide' : 'Show',
                onPressed: () async {
                  final success = await provider.updateWebsiteComponent(
                    websiteId,
                    component.id,
                    component.schemaData,
                    component.position,
                    !currentComponent.visible,
                  );

                  if (success && context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          currentComponent.visible
                              ? 'Component hidden'
                              : 'Component visible',
                        ),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                },
              );
            },
          ),
        ],
      ),
      body: ComponentFormBuilder(
        websiteId: websiteId,
        component: component.componentRegistry,
        initialSchemaData: component.schemaData,
        initialPosition: component.position,
        onCancel: () {
          Navigator.of(context).pop();
        },
        onSubmit: (schemaData, position) async {
          final provider = Provider.of<ComponentProvider>(context, listen: false);
          final success = await provider.updateWebsiteComponent(
            websiteId,
            component.id,
            schemaData,
            position,
            component.visible,
          );

          if (success && context.mounted) {
            Navigator.of(context).pop();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Component updated successfully'),
                backgroundColor: Colors.green,
              ),
            );
          } else if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  provider.errorMessage ?? 'Failed to update component',
                ),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
      ),
    );
  }
}
